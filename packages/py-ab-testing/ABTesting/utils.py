import hashlib
from typing import Any, Dict, Union, List


def hash_with_salt(value, salt):
    # type: (Any, str) -> str
    ret = hashlib.sha256()
    ret.update(salt.encode())
    ret.update(str(value).encode())
    return ret.hexdigest()


def hash_dict(in_dict, salt):
    # type: (Dict[str, Union[List[Any], Any]], str) -> Dict
    return {
        hash_with_salt(k, salt):
            [hash_with_salt(v, salt) for v in value_list]
            if isinstance(value_list, list)
            else hash_with_salt(value_list, salt)
        for k, value_list in in_dict.items()
        if value_list
    }
