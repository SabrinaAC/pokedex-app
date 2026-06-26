// src/screens/FavoritesScreen.js
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  TextInput, StyleSheet, Alert, Modal, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getFavorites, updateFavorite, deleteFavorite } from '../services/favoritesService';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [nickname, setNickname] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const modalAnim = useRef(new Animated.Value(0)).current;

  // READ — Recarrega ao focar na tela
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar favoritos.');
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = (item) => {
    Alert.alert(
      'Remover Favorito',
      `Deseja remover ${item.nickname || item.name} dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover', style: 'destructive',
          onPress: async () => {
            try {
              await deleteFavorite(item.docId);
              setFavorites((prev) => prev.filter((f) => f.docId !== item.docId));
            } catch {
              Alert.alert('Erro', 'Não foi possível remover.');
            }
          },
        },
      ]
    );
  };

  // Abre modal UPDATE
  const handleEdit = (item) => {
    setEditingItem(item);
    setNickname(item.nickname || '');
    setNote(item.note || '');
    setEditModalVisible(true);
    Animated.spring(modalAnim, {
      toValue: 1, tension: 80, friction: 12, useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => setEditModalVisible(false));
  };

  // UPDATE
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updateFavorite(editingItem.docId, { nickname, note });
      setFavorites((prev) =>
        prev.map((f) => f.docId === editingItem.docId ? { ...f, nickname, note } : f)
      );
      closeModal();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const tipoColor = (tipo) => {
    const cores = {
      fire: "#FF6B35", water: "#4FC3F7", grass: "#66BB6A",
      electric: "#FFCA28", psychic: "#EC407A", ice: "#80DEEA",
      dragon: "#5C6BC0", dark: "#4E342E", fairy: "#F48FB1",
      fighting: "#D32F2F", poison: "#8E24AA", ground: "#FFA726",
      flying: "#7986CB", bug: "#8BC34A", rock: "#A1887F",
      ghost: "#9575CD", steel: "#78909C", normal: "#BDBDBD",
    };
    return cores[tipo] || "#888";
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { borderLeftColor: tipoColor(item.tipo1) }]}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={() => navigation.navigate('Detail', {
          pokemon: {
            id: item.pokemonId, nome: item.name, imagem: item.image,
            tipo1: item.tipo1, tipo2: item.tipo2,
            stats: [], abilities: [], altura: 0, peso: 0,
          },
        })}
      >
        <Image source={{ uri: item.image }} style={styles.avatar} resizeMode="contain" />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>
            {item.nickname || item.name}
          </Text>
          {item.nickname ? (
            <Text style={styles.cardOriginal}>original: {item.name}</Text>
          ) : null}
          {item.note ? (
            <Text style={styles.cardNote} numberOfLines={2}>"{item.note}"</Text>
          ) : null}
          <View style={styles.tiposRow}>
            {[item.tipo1, item.tipo2].filter(Boolean).map((t) => (
              <View key={t} style={[styles.tipoBadge, { backgroundColor: tipoColor(t) }]}>
                <Text style={styles.tipoTexto}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Favoritos</Text>
        <Text style={styles.subtitle}>{favorites.length} Pokémons</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
          <Text style={styles.emptySubtitle}>
            Explore a Pokédex e favorite seus preferidos!
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.docId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de edição */}
      <Modal visible={editModalVisible} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalAnim,
                transform: [{
                  scale: modalAnim.interpolate({
                    inputRange: [0, 1], outputRange: [0.85, 1],
                  }),
                }],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Editar Favorito</Text>
            {editingItem && (
              <Text style={styles.modalSubtitle}>{editingItem.name}</Text>
            )}

            <Text style={styles.inputLabel}>Apelido</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Charmandinho"
              placeholderTextColor="#555"
              value={nickname}
              onChangeText={setNickname}
            />

            <Text style={styles.inputLabel}>Anotação</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Suas notas sobre este Pokémon..."
              placeholderTextColor="#555"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A', paddingTop: 50 },
  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1E1E2E',
  },
  title: { color: '#E63946', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#555', fontSize: 12, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  loadingText: { color: '#555', fontSize: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#EAEAEA', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { color: '#555', fontSize: 14, textAlign: 'center', marginTop: 8 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#1E1E2E', borderRadius: 14, borderLeftWidth: 4,
    flexDirection: 'row', alignItems: 'center',
  },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 64, height: 64, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { color: '#EAEAEA', fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
  cardOriginal: { color: '#555', fontSize: 11, marginTop: 1 },
  cardNote: { color: '#888', fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  tiposRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  tipoBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  tipoTexto: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  cardActions: { paddingRight: 12, gap: 8 },
  actionBtn: { padding: 6 },
  actionIcon: { fontSize: 18 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: '#1A1A2E', borderRadius: 20,
    padding: 24, borderWidth: 1, borderColor: '#2A2A3E',
  },
  modalTitle: { color: '#EAEAEA', fontSize: 20, fontWeight: '900', marginBottom: 4 },
  modalSubtitle: { color: '#E63946', fontSize: 14, fontWeight: '700', marginBottom: 20, textTransform: 'capitalize' },
  inputLabel: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#0D0D1A', borderWidth: 1, borderColor: '#2A2A3E',
    borderRadius: 10, padding: 12, color: '#EAEAEA', fontSize: 14, marginBottom: 16,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: '#2A2A3E', alignItems: 'center',
  },
  cancelBtnText: { color: '#888', fontWeight: '700' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#E63946', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});