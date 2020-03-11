# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['test_match_cohort 1'] = [
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'test_allocation',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control'
]

snapshots['test_match_cohort 2'] = [
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'control',
    'test_allocation',
    'control',
    'test_allocation',
    'control',
    'test_allocation',
    'control',
    'control',
    'control',
    'control',
    'control'
]
