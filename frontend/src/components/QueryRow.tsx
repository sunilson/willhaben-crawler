import React from 'react';
import {SearchQuery} from '../models/SearchQuery';
import {Fab, Icon, IconButton, TableCell, TableRow} from '@material-ui/core';
import styled from 'styled-components';
import Checkbox from '@material-ui/core/Checkbox';

interface QueryProps {
  query: SearchQuery;
  onDeleteClicked: () => void;
  onEditClicked: () => void;
}

const HigherTableCell = styled(TableCell)`
  height: 60px;
`;

const QueryRow: React.FunctionComponent<QueryProps> = ({query, onDeleteClicked, onEditClicked}) => {
  return (
    <TableRow>
      <HigherTableCell>{query.category}</HigherTableCell>
      <HigherTableCell>{query.keyword}</HigherTableCell>
      <HigherTableCell>{query.refreshRate}</HigherTableCell>
      <HigherTableCell>
        <Checkbox checked={query.shippingRequired || false} onChange={() => {}} />
      </HigherTableCell>
      <HigherTableCell>{query.minPrice ? query.minPrice.toString() : 'n.A.'} €</HigherTableCell>
      <HigherTableCell>{query.maxPrice ? query.maxPrice.toString() : 'n.A.'} €</HigherTableCell>
      <HigherTableCell>
        <Fab color="secondary" size="small" aria-label="Add" onClick={onDeleteClicked}>
          <Icon fontSize="small">delete</Icon>
        </Fab>
      </HigherTableCell>
      <HigherTableCell>
        <Fab color="primary" size="small" aria-label="Add" onClick={onEditClicked}>
          <Icon fontSize="small">edit</Icon>
        </Fab>
      </HigherTableCell>
    </TableRow>
  );
};

export default QueryRow;
