const EVENT_STATUS = {
    ONGOING: "ONGOING",
    NEXT: "NEXT",
    FINISHED: "FINISHED"
}

const EVENT_TYPE = {
    PUBLIC: "PUBLIC",
    PRIVATE: "PRIVATE",
    EXCLUSIVE: "EXCLUSIVE"
}

const CODE_TYPE = {
    QR: "QR",
    NUMERIC: "NUMERIC",
    INVITE: "INVITE"
}

const FRIEND_STATUS = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED"
}

const NOTIFICATION_TYPE = {
    FRIEND_REQUEST: "PENDING",
    EVENT_START: "EVENT_START",
    EVENT_FINISHED: "EVENT_FINISHED"
}

const IMAGE_TYPE = {
    PROFILE: "PROFILE",
    COLLAGE: "COLLAGE",
    EVENT: "EVENT"
}

const isStringInEnum = function isStringInEnum(stringToCheck, enumToCheck) {
    return Object.values(enumToCheck).includes(stringToCheck.toUpperCase());
}

module.exports = {
    EVENT_STATUS,
    EVENT_TYPE,
    CODE_TYPE,
    FRIEND_STATUS,
    NOTIFICATION_TYPE,
    IMAGE_TYPE,
    isStringInEnum
};