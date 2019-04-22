import React, {useEffect, useState} from 'react';
import {Checkbox, FormControlLabel, Select, Switch, TextField} from '@material-ui/core';
import useInput from '../hooks/useInput';
import {SearchQuery} from '../models/SearchQuery';

interface SearchQueryFormProps {
  oldQuery?: SearchQuery;
  onChange: (query: SearchQuery) => void;
}

export function validateQuery(query: SearchQuery): string | null {
  if (!query.category && !query.keyword) {
    return 'Category or keyword must be filled out!';
  }

  if (query.minPrice && query.maxPrice && query.minPrice > query.maxPrice) {
    return 'Min price cannot be higher than max price!';
  }

  return null;
}

const SearchQueryForm: React.FunctionComponent<SearchQueryFormProps> = ({oldQuery, onChange}) => {
  const query = useInput(oldQuery ? oldQuery.keyword : '');
  const category = useInput(oldQuery ? oldQuery.category : '');
  const refreshRate = useInput(oldQuery ? oldQuery.refreshRate.toString() : '300000');
  const minPrice = useInput(oldQuery && oldQuery.minPrice ? oldQuery.minPrice.toString() : '0');
  const maxPrice = useInput(oldQuery && oldQuery.maxPrice ? oldQuery.maxPrice.toString() : '0');
  const [shippingRequired, setShippingRequired] = useState(oldQuery ? oldQuery.shippingRequired : false);

  useEffect(() => {
    onChange({
      id: oldQuery ? oldQuery.id : '',
      category: category.value,
      keyword: query.value,
      refreshRate: parseInt(refreshRate.value),
      shippingRequired,
      minPrice: parseInt(minPrice.value) !== 0 ? parseInt(minPrice.value) : null,
      maxPrice: parseInt(maxPrice.value) !== 0 ? parseInt(maxPrice.value) : null,
    });
  }, [query.value, category.value, refreshRate.value, shippingRequired, minPrice.value, maxPrice.value]);

  return (
    <>
      <TextField {...query.bind} autoFocus margin="normal" label="Query" fullWidth />
      <TextField {...category.bind} autoFocus margin="normal" label="Category" fullWidth />
      <TextField {...refreshRate.bind} autoFocus margin="normal" label="Refresh Rate" type="number" fullWidth />
      <TextField {...minPrice.bind} autoFocus margin="normal" label="Min Price" type="number" fullWidth />
      <TextField {...maxPrice.bind} autoFocus margin="normal" label="Max Price" type="number" fullWidth />
      <FormControlLabel
        control={<Switch checked={shippingRequired} onChange={() => setShippingRequired(!shippingRequired)} />}
        label="Shipping required"
      />
    </>
  );
};

export default SearchQueryForm;
