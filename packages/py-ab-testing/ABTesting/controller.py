import logging
from typing import Union, Dict

from crc32c import crc32c

logger = logging.getLogger(__name__)


def get_modulo_value(experiment, user_id):
    # type: (str, Union[str, int]) -> int
    return crc32c(str(user_id).encode(), crc32c(experiment.encode())) % 100


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
        self.experiment_configs = {
            experiment_config['name']: experiment_config
            for experiment_config in config['experiments']
        }
        self.user_id = user_id
        self.user_profile = user_profile
        self.matched_cohorts = {}

    def get_cohort(self, experiment_name):
        # type: (str) -> str
        if experiment_name not in self.matched_cohorts:
            if experiment_name in self.experiment_configs:
                self.matched_cohorts[experiment_name] = match_user_cohort(
                    self.experiment_configs[experiment_name],
                    self.user_id,
                    self.user_profile
                )
            else:
                logger.info('unrecognized ab testing experiment name: {}'.format(experiment_name))
                self.matched_cohorts[experiment_name] = 'control'
        return self.matched_cohorts[experiment_name]

    def has_experiment(self, experiment_name):
        return experiment_name in self.experiment_configs
