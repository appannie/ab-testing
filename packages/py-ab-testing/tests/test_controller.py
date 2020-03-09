from unittest.mock import patch

import pytest

from ABTesting import ABTestingController
from ABTesting.controller import match_user_cohort
from ABTesting.utils import hash_dict


@pytest.fixture
def salt():
    return '4a9120a277117afeade34305c258a2f1'


@pytest.fixture
def config(salt):
    return {
        "version": "1.0",
        "experiments": [
            {
                "name": "experiment_1",
                "cohorts": [
                    {
                        "name": "control",
                        "force_include": hash_dict({}, salt)
                    },
                    {
                        "name": "test_allocation",
                        "allocation": [
                            [0, 10],
                            [90, 100]
                        ]
                    },
                    {
                        "name": "test_force_include",
                        "force_include": hash_dict({
                            "user_id": [1],
                            "user_type": ["free"],
                            "email": ["control@example.com"],
                            "email_domain": ["example.com"]
                        }, salt)
                    }
                ]
            },
            {
                "name": "experiment_2",
                "cohorts": [
                    {
                        "name": "control",
                        "force_include": {}
                    },
                    {
                        "name": "test_allocation",
                        "allocation": [
                            [10, 20],
                            [80, 90]
                        ]
                    },
                    {
                        "name": "test_force_include",
                        "force_include": hash_dict({
                            "user_id": [2],
                            "user_type": ["intelligence"],
                            "email": ["control@a.com"],
                            "email_domain": ["a.com"]
                        }, salt)
                    }
                ]
            }
        ],
        "salt": salt
    }


def test_match_cohort(config, salt, snapshot):
    assert ABTestingController(config, 2, hash_dict({'user_id': 2}, salt)).get_cohort(
        'experiment_1'
    ) == 'control'
    assert ABTestingController(config, 1, hash_dict({'user_id': 1}, salt)).get_cohort(
        'experiment_1'
    ) == 'test_force_include'
    assert ABTestingController(
        config,
        2,
        hash_dict({'user_id': 2, 'user_type': 'free'}, salt)
    ).get_cohort('experiment_1') == 'test_force_include'
    assert ABTestingController(
        config,
        2,
        hash_dict({'user_id': 2, 'user_type': 'intelligence'}, salt)
    ).get_cohort('experiment_1') == 'control'
    assert ABTestingController(
        config,
        2,
        hash_dict({'user_id': 2, 'email': 'control@example.com'}, salt)
    ).get_cohort('experiment_1') == 'test_force_include'
    assert ABTestingController(
        config,
        2,
        hash_dict({'user_id': 2, 'email': 'control@a.com'}, salt)
    ).get_cohort('experiment_1') == 'control'
    assert ABTestingController(
        config,
        2,
        hash_dict({'user_id': 2, 'email_domain': 'example.com'}, salt)
    ).get_cohort('experiment_1') == 'test_force_include'
    assert ABTestingController(
        config,
        2,
        hash_dict({'user_id': 2, 'email_domain': 'a.com'}, salt)
    ).get_cohort('experiment_1') == 'control'
    snapshot.assert_match([
        ABTestingController(
            config,
            i + 3,
            hash_dict({'user_id': i + 3}, salt)
        ).get_cohort('experiment_1')
        for i in range(20)
    ])
    assert ABTestingController(config, 1, hash_dict({'user_id': 1}, salt)).get_cohort(
        'experiment_2'
    ) == 'control'
    assert ABTestingController(config, 2, hash_dict({'user_id': 2}, salt)).get_cohort(
        'experiment_2'
    ) == 'test_force_include'
    assert ABTestingController(
        config,
        1,
        hash_dict({'user_id': 1, 'user_type': 'free'}, salt)
    ).get_cohort('experiment_2') == 'control'
    assert ABTestingController(
        config,
        1,
        hash_dict({'user_id': 1, 'user_type': 'intelligence'}, salt)
    ).get_cohort('experiment_2') == 'test_force_include'
    assert ABTestingController(
        config,
        1,
        hash_dict({'user_id': 1, 'email': 'control@example.com'}, salt)
    ).get_cohort('experiment_2') == 'control'
    assert ABTestingController(
        config,
        1,
        hash_dict({'user_id': 1, 'email': 'control@a.com'}, salt)
    ).get_cohort('experiment_2') == 'test_force_include'
    assert ABTestingController(
        config,
        1,
        hash_dict({'user_id': 1, 'email_domain': 'example.com'}, salt)
    ).get_cohort('experiment_2') == 'control'
    assert ABTestingController(
        config,
        1,
        hash_dict({'user_id': 1, 'email_domain': 'a.com'}, salt)
    ).get_cohort('experiment_2') == 'test_force_include'
    snapshot.assert_match([
        ABTestingController(
            config,
            i + 3,
            hash_dict({'user_id': i + 3}, salt)
        ).get_cohort('experiment_2')
        for i in range(20)
    ])
    assert ABTestingController(
        config,
        1,
        hash_dict({'user_id': 1, 'email_domain': 'example.com'}, salt)
    ).get_cohort('experiment_3') == 'control'


def test_match_results_are_cached(config, salt):
    with patch('ABTesting.controller.match_user_cohort', wraps=match_user_cohort) as mocked_match_user_cohort:
        experiment = ABTestingController(
            config,
            1,
            hash_dict({'user_id': 1, 'user_type': 'intelligence'}, salt)
        )
        assert mocked_match_user_cohort.call_count == 0
        assert experiment.get_cohort('experiment_2') == 'test_force_include'
        assert mocked_match_user_cohort.call_count == 1
        assert experiment.get_cohort('experiment_2') == 'test_force_include'
        assert mocked_match_user_cohort.call_count == 1
