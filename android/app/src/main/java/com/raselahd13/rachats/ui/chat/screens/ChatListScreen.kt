package com.raselahd13.rachats.ui.chat.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import timber.log.Timber

@Composable
fun ChatListScreen(
    navController: NavHostController
) {
    var chats by remember { mutableStateOf(listOf<String>()) } // Placeholder

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        // App Bar
        TopAppBar(
            title = { Text("RA Chats") },
            actions = {
                IconButton(onClick = { 
                    Timber.d("Logout clicked")
                    navController.navigate("login") {
                        popUpTo("chat_list") { inclusive = true }
                    }
                }) {
                    Icon(Icons.Default.ExitToApp, contentDescription = "Logout")
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.primary,
                titleContentColor = Color.White,
                actionIconContentColor = Color.White
            )
        )

        // Empty State or Chat List
        if (chats.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No chats yet",
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize()
            ) {
                items(chats) { chat ->
                    ChatItem(chat = chat)
                }
            }
        }
    }
}

@Composable
fun ChatItem(chat: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Avatar placeholder
        Surface(
            modifier = Modifier
                .size(56.dp),
            shape = MaterialTheme.shapes.small,
            color = MaterialTheme.colorScheme.primaryContainer
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text("U")
            }
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .padding(start = 16.dp)
        ) {
            Text(
                text = chat,
                style = MaterialTheme.typography.bodyLarge
            )
            Text(
                text = "Last message...",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}