import React, {useState} from 'react';
import {SearchQuery} from '../models/SearchQuery';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import SearchQueryForm, {validateQuery} from './SearchQueryForm';

interface EditDialogProps {
  open: boolean;
  oldQuery: SearchQuery;
  onClose: () => void;
  onUpdate: (query: SearchQuery) => void;
}

const EditDialog: React.FunctionComponent<EditDialogProps> = ({open, oldQuery, onClose, onUpdate}) => {
  const [query, setQuery] = useState<SearchQuery | null>(null);
  const [error, setError] = useState<string | null>('');

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle id="alert-dialog-title">Add new query</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <SearchQueryForm onChange={query => setQuery(query)} oldQuery={oldQuery} />
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
              onUpdate(query);
            }
          }}
          color="primary"
          autoFocus>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
