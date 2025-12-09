export interface ValidationError {
    loc: Array<string | number>;
    msg: string;
    type: string;
}

export interface HTTPValidationError {
    detail?: ValidationError[];
}

export enum UserRoleEnum {
    USER = "USER",
    ADMINISTRATOR = "ADMINISTRATOR"
}

export enum UserStatusEnum {
    ACTIVE = "ACTIVE",
    DELETED = "DELETED"
}

export enum EventStatusEnum {
    ACTIVE = "ACTIVE",
    PAST = "PAST",
    REJECTED = "REJECTED"
}

export enum ParticipationStatusEnum {
    NONE = "NONE",
    PARTICIPATING = "PARTICIPATING",
    REJECTED = "REJECTED"
}

// Регистрация
export interface RegisterDTO {
    email: string;
    password: string;
    full_name: string;
}

export interface IssuedRegistrationDTO {
    token: string;
}

export interface VerifyRegistrationDTO {
    token: string;
    code: number;
}

// Авторизация
export interface LoginCredentialsDTO {
    email: string;
    password: string;
}

export interface AuthorizationCredentialsDTO {
    login_session_uid: string;
    login_session_token: string;
}

export interface ActiveLoginDTO {
    role: UserRoleEnum;
    email: string;
    full_name: string;
}

// Восстановление пароля
export interface LoginRecoveryRequestDTO {
    email: string;
}

export interface IssuedLoginRecoveryDTO {
    // Empty object for successful response
}

export interface LoginRecoverySubmitDTO {
    token: string;
    password: string;
}

// Пользователи
export interface UserDTO {
    id: number;
    role: UserRoleEnum;
    email: string;
    username: string;
    full_name: string;
    created_at: string;
    deleted_at: string | null;
    status: UserStatusEnum;
    is_system: boolean;
}

export interface UpdateUserDTO {
    role?: UserRoleEnum | null;
    email?: string | null;
    full_name?: string | null;
}

export interface ResetUserPasswordDTO {
    password: string;
    send_email?: boolean;
}

// Мероприятия
export interface CreateEventDTO {
    name: string;
    short_description?: string | null;
    description: string;
    starts_at: string;
    ends_at: string;
    image_url: string;
    payment_info?: string | null;
    max_participants_count?: number | null;
    location?: string | null;
    participants_ids?: number[];
}

export interface UpdateEventDTO {
    name?: string | null;
    short_description?: string | null;
    description?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
    image_url?: string | null;
    payment_info?: string | null;
    max_participants_count?: number | null;
    location?: string | null;
    participants_ids?: number[] | null;
    rejected_at?: string | null;
}

export interface EventDTO {
    id: number;
    name: string;
    short_description: string | null;
    description: string;
    starts_at: string;
    ends_at: string;
    image_url: string;
    payment_info: string | null;
    max_participants_count: number | null;
    location: string | null;
    created_at: string;
    rejected_at: string | null;
    status: EventStatusEnum;
    participants: EventParticipantDTO[];
}

export interface EventCardDTO {
    id: number;
    name: string;
    short_description: string | null;
    description: string;
    starts_at: string;
    ends_at: string;
    image_url: string;
    participants_count: number;
    status: EventStatusEnum;
    participation_status: ParticipationStatusEnum;
}

export interface EventParticipantDTO {
    user_id: number;
    created_at: string;
    status: ParticipationStatusEnum;
}

// Участие
export interface UpdateMyParticipationDTO {
    status: ParticipationStatusEnum;
}

// Файлы
export interface UploadFileResponseDTO {
    url: string;
}

export interface Body_upload_event_image_files_post {
    file: File;
}

// Отладка
export interface InterceptVerificationCodeDTO {
    token: string;
    code: number;
}

export interface InterceptRecoveryTokenDTO {
    token: string;
}

export interface ChangeUserRoleDTO {
    email: string;
    role: UserRoleEnum;
}

export interface ListUsersParams {
    limit?: number;
    full_name?: string | null;
    role?: UserRoleEnum | null;
    status?: UserStatusEnum | null;
    created_from?: string | null;
    created_to?: string | null;
    include_deleted?: boolean;
}

export interface ListEventsParams {
    status?: EventStatusEnum | null;
}

export interface ListEventCardsParams {
    status?: EventStatusEnum | null;
}

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
}
