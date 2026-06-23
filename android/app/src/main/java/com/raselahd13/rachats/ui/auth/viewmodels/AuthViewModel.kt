package com.raselahd13.rachats.ui.auth.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raselahd13.rachats.data.network.AuthService
import com.raselahd13.rachats.data.local.PreferencesManager
import com.raselahd13.rachats.data.network.AuthRequest
import com.raselahd13.rachats.data.network.RegisterRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

data class AuthState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String? = null,
    val userId: String? = null,
    val username: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authService: AuthService,
    private val preferencesManager: PreferencesManager
) : ViewModel() {

    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState(isLoading = true)
            try {
                val response = authService.login(
                    AuthRequest(email = email, password = password)
                )
                if (response.isSuccessful && response.body() != null) {
                    val authResponse = response.body()!!
                    preferencesManager.saveTokens(
                        authResponse.tokens.accessToken,
                        authResponse.tokens.refreshToken
                    )
                    preferencesManager.saveUser(
                        authResponse.user._id,
                        authResponse.user.username,
                        authResponse.user.email,
                        authResponse.user.displayName,
                        authResponse.user.avatar
                    )
                    _authState.value = AuthState(
                        isSuccess = true,
                        userId = authResponse.user._id
                    )
                } else {
                    _authState.value = AuthState(
                        error = response.message() ?: "Login failed"
                    )
                }
            } catch (e: Exception) {
                Timber.e(e)
                _authState.value = AuthState(error = e.message ?: "Unknown error")
            }
        }
    }

    fun register(email: String, username: String, password: String, confirmPassword: String, displayName: String) {
        viewModelScope.launch {
            _authState.value = AuthState(isLoading = true)
            try {
                val response = authService.register(
                    RegisterRequest(
                        email = email,
                        username = username,
                        password = password,
                        confirmPassword = confirmPassword,
                        displayName = displayName
                    )
                )
                if (response.isSuccessful && response.body() != null) {
                    val authResponse = response.body()!!
                    preferencesManager.saveTokens(
                        authResponse.tokens.accessToken,
                        authResponse.tokens.refreshToken
                    )
                    preferencesManager.saveUser(
                        authResponse.user._id,
                        authResponse.user.username,
                        authResponse.user.email,
                        authResponse.user.displayName,
                        authResponse.user.avatar
                    )
                    _authState.value = AuthState(
                        isSuccess = true,
                        userId = authResponse.user._id
                    )
                } else {
                    _authState.value = AuthState(
                        error = response.message() ?: "Registration failed"
                    )
                }
            } catch (e: Exception) {
                Timber.e(e)
                _authState.value = AuthState(error = e.message ?: "Unknown error")
            }
        }
    }
}