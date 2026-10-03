from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.user_res_dto_roles_item import UserResDtoRolesItem
from ..types import UNSET, Unset

T = TypeVar("T", bound="UserResDto")


@_attrs_define
class UserResDto:
    """
    Attributes:
        id (float):
        username (str):
        email (str):
        has_password (bool):
        roles (list[UserResDtoRolesItem]):
        credit (float):
        avatar (str | Unset):
    """

    id: float
    username: str
    email: str
    has_password: bool
    roles: list[UserResDtoRolesItem]
    credit: float
    avatar: str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        username = self.username

        email = self.email

        has_password = self.has_password

        roles = []
        for roles_item_data in self.roles:
            roles_item = roles_item_data.value
            roles.append(roles_item)

        credit = self.credit

        avatar = self.avatar

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "username": username,
                "email": email,
                "hasPassword": has_password,
                "roles": roles,
                "credit": credit,
            }
        )
        if avatar is not UNSET:
            field_dict["avatar"] = avatar

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        username = d.pop("username")

        email = d.pop("email")

        has_password = d.pop("hasPassword")

        roles = []
        _roles = d.pop("roles")
        for roles_item_data in _roles:
            roles_item = UserResDtoRolesItem(roles_item_data)

            roles.append(roles_item)

        credit = d.pop("credit")

        avatar = d.pop("avatar", UNSET)

        user_res_dto = cls(
            id=id,
            username=username,
            email=email,
            has_password=has_password,
            roles=roles,
            credit=credit,
            avatar=avatar,
        )

        user_res_dto.additional_properties = d
        return user_res_dto

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
