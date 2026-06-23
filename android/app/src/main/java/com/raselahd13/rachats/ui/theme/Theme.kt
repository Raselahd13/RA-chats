package com.raselahd13.rachats.ui.theme

import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

private val PrimaryColor = Color(0xFF007AFF)
private val SecondaryColor = Color(0xFF5AC8FA)
private val TertiaryColor = Color(0xFF4CD964)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryColor,
    secondary = SecondaryColor,
    tertiary = TertiaryColor,
    background = Color(0xFFFAFAFA),
    surface = Color.White,
    error = Color(0xFFFF3B30)
)

@Composable
fun RaChatsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        LightColorScheme // TODO: Add dark theme
    } else {
        LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalConfiguration
import com.google.accompanist.systemuicontroller.rememberSystemUiController

@Composable
fun RaChatsThemeWithSystemBars(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    RaChatsTheme(darkTheme = darkTheme) {
        val systemUiController = rememberSystemUiController()
        systemUiController.setSystemBarsColor(
            color = Color(0xFFFAFAFA),
            darkIcons = !darkTheme
        )
        content()
    }
}

import androidx.compose.foundation.isSystemInDarkTheme

val Typography = Typography(
    displayLarge = androidx.compose.material3.Typography().displayLarge,
    displayMedium = androidx.compose.material3.Typography().displayMedium,
    displaySmall = androidx.compose.material3.Typography().displaySmall,
    headlineLarge = androidx.compose.material3.Typography().headlineLarge,
    headlineMedium = androidx.compose.material3.Typography().headlineMedium,
    headlineSmall = androidx.compose.material3.Typography().headlineSmall,
    titleLarge = androidx.compose.material3.Typography().titleLarge,
    titleMedium = androidx.compose.material3.Typography().titleMedium,
    titleSmall = androidx.compose.material3.Typography().titleSmall,
    bodyLarge = androidx.compose.material3.Typography().bodyLarge,
    bodyMedium = androidx.compose.material3.Typography().bodyMedium,
    bodySmall = androidx.compose.material3.Typography().bodySmall,
    labelLarge = androidx.compose.material3.Typography().labelLarge,
    labelMedium = androidx.compose.material3.Typography().labelMedium,
    labelSmall = androidx.compose.material3.Typography().labelSmall
)