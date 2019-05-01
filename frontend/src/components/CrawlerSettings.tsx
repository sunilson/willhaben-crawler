import React, {useState} from 'react';
import {Button, CircularProgress, Icon} from '@material-ui/core';
import axios from 'axios';
import Typography from '@material-ui/core/es/Typography';

const CrawlerSettings: React.FunctionComponent = () => {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const runCrawlers = async () => {
    try {
      setRunning(true);
      await axios.get(`http://sunilson.hopto.org:3333/crawler/run`);
      setRunning(false);
    } catch (e) {
      setError(e.message);
      setTimeout(() => {
        setError('');
        setRunning(false);
      }, 4000);
    }
  };

  return (
    <div style={{marginTop: '40px'}}>
      <Typography component="h2" variant="h5" gutterBottom>
        Crawler settings
      </Typography>
      <Button variant="contained" color="primary" onClick={runCrawlers} disabled={running}>
        {running && !error && <CircularProgress size={20} style={{marginRight: '20px'}} />}
        {running && !error ? 'Running...' : 'Run Crawlers now'}
        <Icon>play_arrow</Icon>
      </Button>
      {error && <div>{error}</div>}
    </div>
  );
};

export default CrawlerSettings;
