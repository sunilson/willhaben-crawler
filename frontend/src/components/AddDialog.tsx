import React, {useState} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import {SearchQuery} from '../models/SearchQuery';
import DialogSearchQueryForm, {validateQuery} from './SearchQueryForm';
import SearchQueryForm from './SearchQueryForm';

interface AddDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (query: SearchQuery) => void;
}

const AddDialog: React.FunctionComponent<AddDialogProps> = ({open, onClose, onAdd}) => {
  const [query, setQuery] = useState<SearchQuery | null>(null);
  const [error, setError] = useState<string | null>('');

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle id="alert-dialog-title">Add new query</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Create a new query that will be executed every few minutes
          <SearchQueryForm onChange={query => setQuery(query)} />
          {error && <div>{error}</div>}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (query) {
              const tempError = validateQuery(query);
              setError(tempError);
              if (tempError) return;
              onAdd(query);
            }
          }}
          color="primary"
          autoFocus>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDialog;
