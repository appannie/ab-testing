from typing import Union, Dict

from crc32c import crc32


def get_modulo_value(experiment, user_id):
    # type: (str, Union[str, int]) -> int
    return crc32(str(user_id).encode(), crc32(experiment.encode())) % 100


def match_user_cohort(
    experiment_config,
    user_id,
    user_profile
):
    # type: (Dict, Union[str, int], Dict[str, str]) -> str
    user_segment_num = get_modulo_value(experiment_config['name'], user_id)
    allocated_cohort = 'control'
    for cohort in experiment_config['cohorts']:
        for force_include_key, force_include_val in cohort.get('force_include', {}).items():
            if force_include_key in user_profile and user_profile[force_include_key] in force_include_val:
                return cohort['name']
        if allocated_cohort == 'control':
            for allocation in cohort.get('allocation', []):
                if allocation[0] <= user_segment_num < allocation[1]:
                    allocated_cohort = cohort['name']
                    break
    return allocated_cohort


class ABTestingController(object):
    def __init__(self, config, user_id, user_profile):
        self.matched_cohorts = {
            experiment_config['name']: match_user_cohort(
                experiment_config,
                user_id,
                user_profile
            )
            for experiment_config in config['experiments']
        }

    def get_cohort(self, experiment_name):
        # type: (str) -> str
        return self.matched_cohorts.get(experiment_name, 'control')
