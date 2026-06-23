package com.raselahd13.rachats.data.network

import retrofit2.Response
import retrofit2.http.*

data class AuthRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val username: String,
    val password: String,
    val confirmPassword: String,
    val displayName: String
)

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val user: UserData,
    val tokens: Tokens
)

data class UserData(
    val _id: String,
    val email: String,
    val username: String,
    val displayName: String,
    val avatar: String?,
    val bio: String,
    val status: String,
    val role: String,
    val isBlocked: Boolean,
    val createdAt: String
)

data class Tokens(
    val accessToken: String,
    val refreshToken: String
)

interface AuthService {
    @POST("/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("/auth/login")
    suspend fun login(@Body request: AuthRequest): Response<AuthResponse>

    @POST("/auth/refresh-token")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<RefreshTokenResponse>

    @POST("/auth/logout")
    suspend fun logout(): Response<ApiResponse>
}

data class RefreshTokenRequest(val refreshToken: String)
data class RefreshTokenResponse(val success: Boolean, val accessToken: String)
data class ApiResponse(val success: Boolean, val message: String)