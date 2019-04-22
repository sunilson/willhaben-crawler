import React, {useState} from 'react';
import {SearchQuery} from '../models/SearchQuery';
import QueryRow from './QueryRow';
import {Table, TableBody, TableCell, TableHead} from '@material-ui/core';
import Typography from '@material-ui/core/es/Typography';
import DeleteDialog from './DeleteDialog';
import {deleteDocFromFirestore, updateDocInFirestore} from '../hooks/useFirebase';
import EditDialog from './EditDialog';

type QueryListProps = {
  queries: SearchQuery[];
  refresh: () => void;
};

const QueryList: React.FunctionComponent<QueryListProps> = ({queries, refresh}) => {
  const [editQuery, setEditQuery] = useState<SearchQuery | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteEntry = async () => {
    await deleteDocFromFirestore(`queries/${deleteId}`);
    setDeleteId(null);
    refresh();
  };

  const updateEntry = async (updateQuery: SearchQuery) => {
    await updateDocInFirestore(`queries/${updateQuery.id}`, updateQuery);
    setEditQuery(null);
    refresh();
  };

  return (
    <div style={{marginTop: '40px'}}>
      <Typography component="h2" variant="h5" gutterBottom>
        All Queries
      </Typography>
      <Table style={{marginTop: '20px'}}>
        <TableHead>
          <TableCell>Category</TableCell>
          <TableCell>Query</TableCell>
          <TableCell>RefreshRate</TableCell>
          <TableCell>Shipping required</TableCell>
          <TableCell>Min Price</TableCell>
          <TableCell>Max price</TableCell>
          <TableCell>Delete</TableCell>
          <TableCell>Edit</TableCell>
        </TableHead>
        <TableBody>
          {queries.map(query => (
            <QueryRow
              query={query}
              onDeleteClicked={() => setDeleteId(query.id)}
              onEditClicked={() => setEditQuery(query)}
            />
          ))}
        </TableBody>
      </Table>
      <DeleteDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onDelete={deleteEntry} />
      {editQuery && (
        <EditDialog
          open={editQuery !== null}
          oldQuery={editQuery}
          onClose={() => setEditQuery(null)}
          onUpdate={updateEntry}
        />
      )}
    </div>
  );
};

export default QueryList;
