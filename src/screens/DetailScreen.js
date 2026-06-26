// src/screens/DetailScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Alert,
} from 'react-native';
import { addFavorite, getFavorites, deleteFavorite } from '../services/favoritesService';

export default function DetailScreen({ route, navigation }) {
  const { pokemon } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteDocId, setFavoriteDocId] = useState(null);
  const [loadingFav, setLoadingFav] = useState(false);

  const imageScale = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const statAnims = useRef(
    (pokemon.stats || []).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.spring(imageScale, {
      toValue: 1, tension: 60, friction: 8, delay: 100, useNativeDriver: true,
    }).start();

    const animations = statAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1, duration: 500, delay: 200 + i * 80, useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();

    checkIfFavorite();
  }, []);

  const checkIfFavorite = async () => {
    try {
      const favorites = await getFavorites();
      const found = favorites.find((f) => f.pokemonId === pokemon.id);
      if (found) {
        setIsFavorite(true);
        setFavoriteDocId(found.docId);
      }
    } catch (e) {
      console.log('Erro ao verificar favoritos:', e);
    }
  };

  const toggleFavorite = async () => {
    setLoadingFav(true);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, tension: 200, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, tension: 200, useNativeDriver: true }),
    ]).start();

    try {
      if (isFavorite && favoriteDocId) {
        await deleteFavorite(favoriteDocId);
        setIsFavorite(false);
        setFavoriteDocId(null);
        Alert.alert('Removido', `${pokemon.nome} foi removido dos favoritos.`);
      } else {
        const docId = await addFavorite(pokemon);
        setIsFavorite(true);
        setFavoriteDocId(docId);
        Alert.alert('Favoritado! ⭐', `${pokemon.nome} foi adicionado aos favoritos!`);
      }
    } catch (e) {
      Alert.alert('Erro', 'Verifique a configuração do Firebase.');
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>← Voltar</Text>
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={loadingFav}
            style={[
              styles.favBtn,
              { backgroundColor: isFavorite ? '#E63946' : '#1E1E2E' }
            ]}
          >
            <Text style={styles.favIcon}>
              {loadingFav ? '...' : isFavorite ? '⭐ Favoritado' : '☆ Favoritar'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagem */}
        <View style={styles.heroSection}>
          <Text style={styles.pokemonNumber}>#{String(pokemon.id).padStart(3, '0')}</Text>
          <Animated.Image
            source={{ uri: pokemon.imagem }}
            style={[styles.pokemonImage, { transform: [{ scale: imageScale }] }]}
            resizeMode="contain"
          />
          <Text style={styles.pokemonName}>{pokemon.nome}</Text>
          <View style={styles.typesRow}>
            {[pokemon.tipo1, pokemon.tipo2].filter(Boolean).map((tipo) => (
              <View key={tipo} style={[styles.typeBadge, { backgroundColor: tipoColor(tipo) }]}>
                <Text style={styles.typeText}>{tipo}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Altura</Text>
            <Text style={styles.infoValue}>{(pokemon.altura / 10).toFixed(1)} m</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Peso</Text>
            <Text style={styles.infoValue}>{(pokemon.peso / 10).toFixed(1)} kg</Text>
          </View>
        </View>

        {/* Habilidades */}
        {pokemon.abilities && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <View style={styles.abilitiesRow}>
              {pokemon.abilities.map((a) => (
                <View key={a} style={styles.abilityBadge}>
                  <Text style={styles.abilityText}>{a.replace('-', ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        {pokemon.stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estatísticas Base</Text>
            {pokemon.stats.map((stat, i) => {
              const barWidth = statAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', `${(stat.value / 255) * 100}%`],
              });
              const statColor = stat.value < 50 ? '#E63946' : stat.value < 80 ? '#FF9800' : '#4CAF50';
              return (
                <View key={stat.name} style={styles.statRow}>
                  <Text style={styles.statName}>{formatStat(stat.name)}</Text>
                  <Text style={[styles.statValue, { color: statColor }]}>{stat.value}</Text>
                  <View style={styles.statBarBg}>
                    <Animated.View style={[styles.statBar, { width: barWidth, backgroundColor: statColor }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function tipoColor(tipo) {
  const cores = {
    fire: "#FF6B35", water: "#4FC3F7", grass: "#66BB6A",
    electric: "#FFCA28", psychic: "#EC407A", ice: "#80DEEA",
    dragon: "#5C6BC0", dark: "#4E342E", fairy: "#F48FB1",
    fighting: "#D32F2F", poison: "#8E24AA", ground: "#FFA726",
    flying: "#7986CB", bug: "#8BC34A", rock: "#A1887F",
    ghost: "#9575CD", steel: "#78909C", normal: "#BDBDBD",
  };
  return cores[tipo] || "#888";
}

function formatStat(name) {
  const map = {
    hp: 'HP', attack: 'Ataque', defense: 'Defesa',
    'special-attack': 'Atq. Esp.', 'special-defense': 'Def. Esp.', speed: 'Velocidade',
  };
  return map[name] || name;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A', paddingTop: 50 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { padding: 8 },
  backArrow: { color: '#EAEAEA', fontSize: 16, fontWeight: '700' },
  favBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  favIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroSection: { alignItems: 'center', paddingVertical: 16 },
  pokemonNumber: { color: '#E63946', fontSize: 14, fontWeight: '700' },
  pokemonImage: { width: 200, height: 200 },
  pokemonName: {
    color: '#EAEAEA', fontSize: 28, fontWeight: '900',
    marginTop: 8, textTransform: 'capitalize',
  },
  typesRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  typeBadge: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 99 },
  typeText: { color: '#fff', fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  infoGrid: { flexDirection: 'row', margin: 16, gap: 12 },
  infoCard: {
    flex: 1, backgroundColor: '#1E1E2E', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  infoLabel: { color: '#666', fontSize: 12, marginBottom: 4 },
  infoValue: { color: '#EAEAEA', fontSize: 20, fontWeight: '800' },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: {
    color: '#E63946', fontSize: 14, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  abilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  abilityBadge: {
    borderWidth: 1.5, borderColor: '#E63946',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6,
  },
  abilityText: { color: '#E63946', fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statName: { color: '#888', fontSize: 12, width: 80 },
  statValue: { fontSize: 13, fontWeight: '700', width: 36, textAlign: 'right', marginRight: 10 },
  statBarBg: { flex: 1, height: 8, backgroundColor: '#1E1E2E', borderRadius: 4, overflow: 'hidden' },
  statBar: { height: '100%', borderRadius: 4 },
});