import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const ROLE_LABELS = {
  user: 'Usuario',
  moderator: 'Moderador',
  superadmin: 'Superadmin',
};

const ROLE_COLORS = {
  user: colors.textMuted,
  moderator: colors.accentSecondary,
  superadmin: colors.accentPrimary,
};

function ProfileScreen({ navigation }) {
  const { user, logOut } = useApp();
  const role = user.user?.role || 'user';
  const isSuperadmin = role === 'superadmin';
  const isModerator = role === 'moderator' || isSuperadmin;

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>
          {(user.user?.name || '?').charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.name}>{user.user?.name}</Text>
      <Text style={styles.email}>{user.user?.email}</Text>

      <View style={[styles.roleBadge, { borderColor: ROLE_COLORS[role] }]}>
        <Text style={[styles.roleBadgeText, { color: ROLE_COLORS[role] }]}>
          {ROLE_LABELS[role]}
        </Text>
      </View>

      {isModerator && (
        <View style={styles.adminSection}>
          <Text style={styles.adminSectionTitle}>Zona de moderación</Text>

          {isSuperadmin && (
            <>
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => navigation.navigate('ManageMovies')}
              >
                <Ionicons name="film-outline" size={18} color={colors.text} />
                <Text style={styles.adminButtonText}>Administrar películas</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => navigation.navigate('ManageUsers')}
              >
                <Ionicons name="people-outline" size={18} color={colors.text} />
                <Text style={styles.adminButtonText}>Administrar usuarios</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </>
          )}

          {!isSuperadmin && (
            <Text style={styles.adminHint}>
              Como moderador podés borrar cualquier comentario o reseña desde el detalle de
              cada película.
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={logOut}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: colors.onAccentPrimary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  email: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  adminSection: {
    width: '100%',
    marginTop: 32,
  },
  adminSectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  adminButtonText: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },
  adminHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 32,
  },
  buttonText: {
    color: colors.danger,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
