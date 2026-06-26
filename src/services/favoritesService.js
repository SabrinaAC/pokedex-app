import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'favorites';


export async function addFavorite(pokemon) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    pokemonId: pokemon.id,
    name: pokemon.nome,
    image: pokemon.imagem,
    tipo1: pokemon.tipo1,
    tipo2: pokemon.tipo2 || null,
    nickname: '',
    note: '',
    addedAt: new Date().toISOString(),
  });
  return docRef.id;
}


export async function getFavorites() {
  const q = query(collection(db, COLLECTION), orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ docId: d.id, ...d.data() }));
}


export async function updateFavorite(docId, { nickname, note }) {
  const ref = doc(db, COLLECTION, docId);
  await updateDoc(ref, { nickname, note });
}


export async function deleteFavorite(docId) {
  await deleteDoc(doc(db, COLLECTION, docId));
}
