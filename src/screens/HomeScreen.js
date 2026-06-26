import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";

export default function HomeScreen({ navigation }) {
  const [pokemon, setPokemon] = useState(null);
  const [id, setId] = useState(1);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchPokemon(id);
  }, [id]);

  const animarImagem = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const fetchPokemon = async (valor) => {
    try {
      setErro(false);
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${valor}`
      );
      if (!response.ok) throw new Error("Não encontrado");
      const data = await response.json();

      const poke = {
        id: data.id,
        nome: data.name.toUpperCase(),
        imagem: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
        tipo1: data.types[0]?.type.name,
        tipo2: data.types[1]?.type.name,
        altura: data.height,
        peso: data.weight,
        stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
        abilities: data.abilities.map((a) => a.ability.name),
      };

      setPokemon(poke);
      setId(data.id);
      animarImagem();
    } catch (error) {
      setErro(true);
    }
  };

  const handleAnterior = () => { if (id > 1) setId(id - 1); };
  const handleProximo = () => { setId(id + 1); };
  const handleBusca = () => {
    if (busca.trim() === "") return;
    fetchPokemon(busca.toLowerCase().trim());
    setBusca("");
  };
  const handleVoltarInicio = () => { setId(1); };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.areaLogo}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
      </View>

      {pokemon && (
        <Text style={styles.pokemonId}>#{String(pokemon.id).padStart(3, "0")}</Text>
      )}

      <View style={styles.areaImagem}>
        {erro ? (
          <Text style={styles.erroTexto}>Pokémon não encontrado!</Text>
        ) : (
          <Animated.Image
            source={{ uri: pokemon?.imagem }}
            style={[styles.imagemPoke, { transform: [{ scale: scaleAnim }] }]}
            resizeMode="contain"
          />
        )}
      </View>

      {pokemon && !erro && (
        <View style={styles.areaDesc}>
          <Text style={styles.nomePokemon}>{pokemon.nome}</Text>
          <View style={styles.tiposRow}>
            <View style={[styles.tipoBadge, { backgroundColor: tipoColor(pokemon.tipo1) }]}>
              <Text style={styles.tipoTexto}>{pokemon.tipo1}</Text>
            </View>
            {pokemon.tipo2 && (
              <View style={[styles.tipoBadge, { backgroundColor: tipoColor(pokemon.tipo2) }]}>
                <Text style={styles.tipoTexto}>{pokemon.tipo2}</Text>
              </View>
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoTexto}>⚖️ {pokemon.peso / 10} kg</Text>
            <Text style={styles.infoTexto}>📏 {pokemon.altura / 10} m</Text>
          </View>
        </View>
      )}

      {/* Botão Ver Detalhes */}
      {pokemon && !erro && (
        <TouchableOpacity
          style={styles.btnDetalhes}
          onPress={() => navigation.navigate("Detail", { pokemon })}
        >
          <Text style={styles.txtBtnDetalhes}>Ver Detalhes →</Text>
        </TouchableOpacity>
      )}

      <View style={styles.areaBusca}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nome ou ID..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={handleBusca}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.btnBusca} onPress={handleBusca}>
          <Text style={styles.txtBtnBusca}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.areaBtn}>
        <TouchableOpacity
          style={[styles.btn, id <= 1 && styles.btnDesabilitado]}
          onPress={handleAnterior}
          disabled={id <= 1}
        >
          <Text style={styles.txtBtn}>◀ Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnInicio} onPress={handleVoltarInicio}>
          <Text style={styles.txtBtnInicio}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleProximo}>
          <Text style={styles.txtBtn}>Próximo ▶</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  areaLogo: { marginBottom: 8 },
  logo: { width: 180, height: 70 },
  pokemonId: { color: "#E63946", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  areaImagem: {
    width: 200, height: 200, alignItems: "center", justifyContent: "center",
    backgroundColor: "#1E1E2E", borderRadius: 100, marginBottom: 12,
    borderWidth: 2, borderColor: "#E63946",
  },
  imagemPoke: { width: 170, height: 170 },
  erroTexto: { color: "#E63946", fontWeight: "bold", textAlign: "center" },
  areaDesc: { alignItems: "center", marginBottom: 8 },
  nomePokemon: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", letterSpacing: 2, marginBottom: 8 },
  tiposRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  tipoBadge: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 99 },
  tipoTexto: { color: "#fff", fontWeight: "700", fontSize: 13, textTransform: "capitalize" },
  infoRow: { flexDirection: "row", gap: 20 },
  infoTexto: { color: "#aaa", fontSize: 14 },
  btnDetalhes: {
    backgroundColor: "#1E1E2E", borderWidth: 1, borderColor: "#E63946",
    paddingHorizontal: 24, paddingVertical: 8, borderRadius: 10, marginBottom: 12,
  },
  txtBtnDetalhes: { color: "#E63946", fontWeight: "700", fontSize: 14 },
  areaBusca: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1E1E2E",
    borderRadius: 12, borderWidth: 1, borderColor: "#2A2A3E",
    paddingHorizontal: 12, marginBottom: 16, width: "100%",
  },
  input: { flex: 1, color: "#fff", fontSize: 14, paddingVertical: 10 },
  btnBusca: { padding: 6 },
  txtBtnBusca: { fontSize: 20 },
  areaBtn: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 20 },
  btn: { backgroundColor: "#E63946", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnDesabilitado: { backgroundColor: "#555" },
  txtBtn: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  btnInicio: {
    backgroundColor: "#1E1E2E", padding: 10, borderRadius: 10,
    borderWidth: 1, borderColor: "#E63946",
  },
  txtBtnInicio: { fontSize: 20 },
});
