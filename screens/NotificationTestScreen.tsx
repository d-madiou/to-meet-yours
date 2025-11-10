import React from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';
import { notificationService } from '../src/services/notification.service';

export default function NotificationTestScreen() {
  const testLocalNotification = async () => {
    await notificationService.scheduleLocalNotification(
      'Test Notification',
      'This is a test notification from your app!',
      { type: 'like', username: 'TestUser' }
    );
    Alert.alert('Success', 'Local notification sent');
  };

  const testLikeNotification = async () => {
    await notificationService.scheduleLocalNotification(
      'New Like! 💖',
      'John liked you!',
      { type: 'like', username: 'John', userId: 'test-123' }
    );
  };

  const testMatchNotification = async () => {
    await notificationService.scheduleLocalNotification(
      "It's a Match! 🎉",
      'You and Sarah liked each other!',
      { type: 'match', username: 'Sarah', matchId: 'match-456' }
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Test Local Notification" onPress={testLocalNotification} />
      <Button title="Test Like Notification" onPress={testLikeNotification} />
      <Button title="Test Match Notification" onPress={testMatchNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
});