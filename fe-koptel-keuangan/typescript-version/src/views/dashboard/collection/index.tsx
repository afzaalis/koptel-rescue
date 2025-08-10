// ** React Imports
import React, { useState, SyntheticEvent } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

// ** Custom Components
import CollectionSales from './Collection';
import CollectionKopeg from './CollectionKopeg';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CollectionIndex = () => {
  // 0 = Collection Kopeg, 1 = Collection Sales
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Dashboard Collection
          </Typography>
          <Tabs value={activeTab} onChange={handleChange} aria-label="collection navigation tabs">
            <Tab label="Collection Kopeg" />
            <Tab label="Collection Sales" />
          </Tabs>
        </CardContent>
      </Card>

      <TabPanel value={activeTab} index={0}>
        <CollectionKopeg />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <CollectionSales />
      </TabPanel>
    </Box>
  );
};

export default CollectionIndex;