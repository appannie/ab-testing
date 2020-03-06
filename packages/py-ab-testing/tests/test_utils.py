import pytest

from ABTesting.utils import hash_dict


@pytest.fixture
def salt():
    return '4a9120a277117afeade34305c258a2f1'


def test_hash_object_plain(salt):
    assert hash_dict({}, salt) == {}
    assert hash_dict(
        {
            'user_id': 2,
            'user_type': 'intelligence',
            'email': 'control@a.com',
            'email_domain': 'a.com',
        },
        salt
    ) == {
               '559585298de65441d096a03315c848e25a5ceff9eea48bf5041e24ea4d481022':
                   'd35efdfffec2f18661a2fdce592ba8237c8f12753bfaf3f3e7456304393764b8',
               '6ac346cad30f3196adbe9cb6f546cb8115b9f8998d1346b004481d1a6eb102f9':
                   '26e0a9e7e1dfe33ce15ef16cb7a1e0086ee7916ec10eb52a4a8fffe00ae3a40c',
               '0a107badb326491ebb2a4483d5b1d86e87c98ea21a34c29c32bf6205d0245e6e':
                   'ea799fdde1713dbf6bb5c666c3117ab8d19254966997fa413394c0b33ca5bab6',
               '7aa814f6be9d13c1fc70d8d32a34dcce812381be4754c711540310b256e10e80':
                   '10a3c3b449ed70682d756f3f6b980595ebc284819250730a4ffc184e08c0b3f6',
           }

    assert hash_dict(
        {
            'user_id': 2,
            'user_type': 'intelligence',
            'email_domain': None,
        },
        salt
    ) == {
               '559585298de65441d096a03315c848e25a5ceff9eea48bf5041e24ea4d481022':
                   'd35efdfffec2f18661a2fdce592ba8237c8f12753bfaf3f3e7456304393764b8',
               '6ac346cad30f3196adbe9cb6f546cb8115b9f8998d1346b004481d1a6eb102f9':
                   '26e0a9e7e1dfe33ce15ef16cb7a1e0086ee7916ec10eb52a4a8fffe00ae3a40c',
           }


def test_hash_object_array(salt):
    assert hash_dict({}, salt) == {}
    assert hash_dict(
        {
            'user_id': [2],
            'user_type': ['intelligence'],
            'email': ['control@a.com'],
            'email_domain': ['a.com'],
        },
        salt
    ) == {
               '559585298de65441d096a03315c848e25a5ceff9eea48bf5041e24ea4d481022': [
                   'd35efdfffec2f18661a2fdce592ba8237c8f12753bfaf3f3e7456304393764b8',
               ],
               '6ac346cad30f3196adbe9cb6f546cb8115b9f8998d1346b004481d1a6eb102f9': [
                   '26e0a9e7e1dfe33ce15ef16cb7a1e0086ee7916ec10eb52a4a8fffe00ae3a40c',
               ],
               '0a107badb326491ebb2a4483d5b1d86e87c98ea21a34c29c32bf6205d0245e6e': [
                   'ea799fdde1713dbf6bb5c666c3117ab8d19254966997fa413394c0b33ca5bab6',
               ],
               '7aa814f6be9d13c1fc70d8d32a34dcce812381be4754c711540310b256e10e80': [
                   '10a3c3b449ed70682d756f3f6b980595ebc284819250730a4ffc184e08c0b3f6',
               ],
           }
    assert hash_dict(
        {
            'user_id': [2],
            'user_type': ['intelligence'],
            'email_domain': None,
        },
        salt
    ) == {
               '559585298de65441d096a03315c848e25a5ceff9eea48bf5041e24ea4d481022': [
                   'd35efdfffec2f18661a2fdce592ba8237c8f12753bfaf3f3e7456304393764b8',
               ],
               '6ac346cad30f3196adbe9cb6f546cb8115b9f8998d1346b004481d1a6eb102f9': [
                   '26e0a9e7e1dfe33ce15ef16cb7a1e0086ee7916ec10eb52a4a8fffe00ae3a40c',
               ],
           }
