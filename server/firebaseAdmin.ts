import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  DocumentData,
  WhereFilterOp,
  OrderByDirection,
  Firestore,
} from 'firebase/firestore';

let config: any = {};
try {
  const raw = fs.readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
  config = JSON.parse(raw);
} catch (e) {
  console.warn('Could not read firebase-applet-config.json on server:', e);
}

const appName = 'autointel-server-app';
const clientApp: FirebaseApp =
  getApps().find((a) => a.name === appName) || initializeApp(config, appName);

const rawDb: Firestore = getFirestore(clientApp, config.firestoreDatabaseId);

interface QueryConstraintItem {
  type: 'where' | 'orderBy' | 'limit';
  args: any[];
}

function createDocWrapper(docPath: string) {
  return {
    async get() {
      const dRef = doc(rawDb, docPath);
      const snap = await getDoc(dRef);
      return {
        id: snap.id,
        get exists() {
          return snap.exists();
        },
        data: () => snap.data(),
        ref: {
          update: async (data: DocumentData) => updateDoc(dRef, data),
          set: async (data: DocumentData, options?: { merge?: boolean }) => setDoc(dRef, data, options || {}),
        },
      };
    },
    async set(data: DocumentData, options?: { merge?: boolean }) {
      const dRef = doc(rawDb, docPath);
      await setDoc(dRef, data, options || {});
      return { id: dRef.id };
    },
    async update(data: DocumentData) {
      const dRef = doc(rawDb, docPath);
      await updateDoc(dRef, data);
      return { id: dRef.id };
    },
    collection(subColName: string) {
      return createCollectionWrapper(`${docPath}/${subColName}`);
    },
  };
}

function createCollectionWrapper(collectionPath: string, constraints: QueryConstraintItem[] = []) {
  return {
    doc(docId: string) {
      return createDocWrapper(`${collectionPath}/${docId}`);
    },
    where(field: string, op: WhereFilterOp, value: any) {
      return createCollectionWrapper(collectionPath, [
        ...constraints,
        { type: 'where', args: [field, op, value] },
      ]);
    },
    orderBy(field: string, dir: OrderByDirection = 'asc') {
      return createCollectionWrapper(collectionPath, [
        ...constraints,
        { type: 'orderBy', args: [field, dir] },
      ]);
    },
    limit(n: number) {
      return createCollectionWrapper(collectionPath, [
        ...constraints,
        { type: 'limit', args: [n] },
      ]);
    },
    async get() {
      const colRef = collection(rawDb, collectionPath);
      const builtConstraints = constraints.map((c) => {
        if (c.type === 'where') return where(c.args[0], c.args[1], c.args[2]);
        if (c.type === 'orderBy') return orderBy(c.args[0], c.args[1]);
        if (c.type === 'limit') return limit(c.args[0]);
        throw new Error(`Unknown constraint: ${c.type}`);
      });
      const q = query(colRef, ...builtConstraints);
      const snap = await getDocs(q);
      return {
        docs: snap.docs.map((d) => {
          const docRef = doc(rawDb, `${collectionPath}/${d.id}`);
          return {
            id: d.id,
            get exists() {
              return d.exists();
            },
            data: () => d.data(),
            ref: {
              update: async (data: DocumentData) => updateDoc(docRef, data),
              set: async (data: DocumentData, options?: { merge?: boolean }) => setDoc(docRef, data, options || {}),
            },
          };
        }),
        empty: snap.empty,
        size: snap.size,
      };
    },
    async add(data: DocumentData) {
      const colRef = collection(rawDb, collectionPath);
      const ref = await addDoc(colRef, data);
      return { id: ref.id };
    },
  };
}

export const adminDb = {
  collection(collectionName: string) {
    return createCollectionWrapper(collectionName);
  },
};

export const adminApp = clientApp;
export const adminAuth = {
  async verifyIdToken(_token: string) {
    return null;
  },
};
export { config };

