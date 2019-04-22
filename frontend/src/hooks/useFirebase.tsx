import {useState} from 'react';
import * as firebase from 'firebase';
import {FirebaseCompatible} from '../models/FirebaseCompatible';
const fb = firebase.initializeApp({
  apiKey: 'AIzaSyAq_Q3TzlXnXJgOCQ5M_urTUwzDy1geS_c',
  projectId: 'willhaben-crawler',
  databaseURL: 'https://willhaben-crawler.firebaseio.com',
});

interface FirebaseGetMethod<T> {
  isLoading: boolean;
  value: T | null;
  error: Error | null;
  execute: (path: string) => void;
}

export const addDocToFirestore = async <T extends FirebaseCompatible>(path: string, value: T): Promise<any> => {
  delete value.id;
  await fb
    .firestore()
    .collection(path)
    .add(value);
};

export const deleteDocFromFirestore = async (path: string): Promise<any> => {
  await fb
    .firestore()
    .doc(path)
    .delete();
};

export const updateDocInFirestore = async <T extends FirebaseCompatible>(path: string, value: T): Promise<any> => {
  delete value.id;
  await fb
    .firestore()
    .doc(path)
    .update(value);
};

export const useFirebaseCollection = <T extends FirebaseCompatible>(): FirebaseGetMethod<Array<T>> => {
  const [value, setValue] = useState<Array<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (path: string) => {
    setIsLoading(true);
    try {
      const res = await fb
        .firestore()
        .collection(path)
        .get();
      const result: T[] = [];
      res.forEach(entity => {
        const newEntity = entity.data() as T;
        newEntity.id = entity.id;
        result.push(newEntity);
      });
      console.log(result);
      setValue(result);
    } catch (e) {
      setError(e);
    }
    setIsLoading(false);
  };

  return {
    value,
    isLoading,
    error,
    execute,
  };
};
