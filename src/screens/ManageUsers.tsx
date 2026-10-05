import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { mockGetAllUsers, mockUpdateUserRole } from '../mockData';
import { colors, fonts } from '../theme';

const ROLE_OPTIONS = [
  { label: 'Usuario', value: 'user' },
  { label: 'Moderador', value: 'moderator' },
  { label: 'Superadmin', value: 'superadmin' },
];

function ManageUsersScreen() {
  const { user } = useAuth();
  // La lista de usuarios solo la usa esta pantalla: estado local
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockGetAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function updateUserRole(userId, role) {
    try {
      const updated = await mockUpdateUserRole(userId, role);
      setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Administrar usuarios</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accentPrimary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
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
                    onValueChange={(value) => updateUserRole(item.id, value)}
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
    fontFamily: fonts.title,
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
    fontFamily: fonts.body,
    marginTop: 10,
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
    fontFamily: fonts.bodyBold,
  },
  rowBody: {
    flex: 1,
    marginLeft: 10,
  },
  rowName: {
    color: colors.text,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  selfTag: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  rowEmail: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  pickerWrapper: {
    width: 150,
  },
  picker: {
    color: colors.text,
  },
});

export default ManageUsersScreen;
