import React, {Component, useEffect, useState} from 'react';
import './App.css';
import {addDocToFirestore, useFirebaseCollection} from './hooks/useFirebase';
import QueryList from './components/QueryList';
import {Grid, Icon, Paper} from '@material-ui/core';
import Typography from '@material-ui/core/es/Typography';
import Fab from '@material-ui/core/es/Fab';
import {SearchQuery} from './models/SearchQuery';
import AddDialog from './components/AddDialog';
import CrawlerSettings from './components/CrawlerSettings';

const App: React.FunctionComponent = () => {
  const [add, setAdd] = useState(false);
  const getFirebaseCollection = useFirebaseCollection<SearchQuery>();

  useEffect(() => {
    getFirebaseCollection.execute('queries');
  }, []);

  const refresh = () => {
    getFirebaseCollection.execute('queries');
  };

  const addQuery = async (query: SearchQuery) => {
    setAdd(false);
    await addDocToFirestore<SearchQuery>('queries', query);
    refresh();
  };

  return (
    <>
      <Grid container>
        <Grid item xs={1} />
        <Grid item xs={10} style={{padding: '20px'}}>
          <Paper style={{padding: '20px'}}>
            <Typography component="h1" variant="h4" gutterBottom>
              Willhaben Crawler
            </Typography>
            <CrawlerSettings />
            {getFirebaseCollection.isLoading || !getFirebaseCollection.value ? (
              <div>Loading..</div>
            ) : (
              <QueryList queries={getFirebaseCollection.value} refresh={refresh} />
            )}
            {getFirebaseCollection.error && <div>{getFirebaseCollection.error.message}</div>}
          </Paper>
        </Grid>
      </Grid>
      <Fab
        color="secondary"
        onClick={() => setAdd(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
        }}>
        <Icon>add</Icon>
      </Fab>
      <AddDialog open={add} onClose={() => setAdd(false)} onAdd={addQuery} />
    </>
  );
};

export default App;
