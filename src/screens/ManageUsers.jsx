import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { connectScreen } from '../redux/helpers';
import { colors } from '../theme';

const ROLE_OPTIONS = [
  { label: 'Usuario', value: 'user' },
  { label: 'Moderador', value: 'moderator' },
  { label: 'Superadmin', value: 'superadmin' },
];

function ManageUsersScreen({ admin, user, fetchAllUsers, updateUserRole }) {
  useEffect(() => {
    fetchAllUsers(user.user.id);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Administrar usuarios</Text>

      {admin.isFetchingUsers ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accentPrimary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : admin.error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{admin.error}</Text>
        </View>
      ) : (
        <FlatList
          data={admin.users}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelf = item.id === user.user.id;
            return (
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowName}>
                    {item.name} {isSelf ? <Text style={styles.selfTag}>(vos)</Text> : null}
                  </Text>
                  <Text style={styles.rowEmail}>{item.email}</Text>
                </View>
                <View style={styles.pickerWrapper}>
                  <Picker
                    enabled={!isSelf}
                    selectedValue={item.role}
                    style={styles.picker}
                    dropdownIconColor={colors.text}
                    onValueChange={(value) => updateUserRole(user.user.id, item.id, value)}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centered: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: colors.onAccentPrimary,
    fontWeight: 'bold',
  },
  rowBody: {
    flex: 1,
    marginLeft: 10,
  },
  rowName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  selfTag: {
    color: colors.textMuted,
    fontWeight: 'normal',
    fontSize: 12,
  },
  rowEmail: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  pickerWrapper: {
    width: 150,
  },
  picker: {
    color: colors.text,
  },
});

function mapStateToProps(state) {
  return { admin: state.admin, user: state.users };
}

export default connectScreen(ManageUsersScreen, mapStateToProps);
