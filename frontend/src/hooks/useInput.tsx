import React, {useState} from 'react';

type UseInputBinding = {
  value: string;
  setError: (error: string | null) => void;
  bind: {
    value: string;
    error: boolean;
    helperText: string | null;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
};

const useInput = (initialValue: string = ''): UseInputBinding => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  return {
    value,
    setError,
    bind: {
      value,
      error: error !== null,
      helperText: error,
      onChange: event => setValue(event.target.value),
    },
  };
};

export default useInput;
