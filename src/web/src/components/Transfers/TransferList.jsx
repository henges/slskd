import React, { Component, useState } from 'react';

import {
  Checkbox, SemanticCOLORS,
} from 'semantic-ui-react';

import { formatBytes, formatBytesAsUnit, getFileName } from '../../lib/util';

import { 
  Header, 
  Table, 
  Icon, 
  List, 
  Progress,
  Button,
} from 'semantic-ui-react';
import { Direction as TransferDirection, TransferFile } from '../../types/transfers';

const getColor = (state) => {
  switch(state) {
  case 'InProgress':
    return { color: 'blue' }; 
  case 'Completed, Succeeded':
    return { color: 'green' };
  case 'Requested':
  case 'Queued, Locally':
  case 'Queued, Remotely':
  case 'Queued':
    return {};
  case 'Initializing':
    return { color: 'teal' };
  default:
    return { color: 'red' };
  }
};

const isRetryableState = (state) => getColor(state).color === 'red';
const isQueuedState = (state) => state.includes('Queued');

const formatBytesTransferred = ({ transferred, size }) => {
  const [s, sExt] = formatBytes(size, 1).split(' ');
  const t = formatBytesAsUnit(transferred, 1, sExt);

  return `${t}/${s} ${sExt}`;
};

const TransferList = ({directoryName, files, onRetryRequested, onSelectionChange, onPlaceInQueueRequested}) => {

  const [isFolded, setIsFolded] = useState<boolean>(false);

  const handleClick = (file) => {
    const { state, direction } = file;

    if (direction === 'Download') {
      if (isRetryableState(state)) {
        return onRetryRequested(file);
      }
    
      if (isQueuedState(state)) {
        return onPlaceInQueueRequested(file);
      }
    }    
  };

  const toggleFolded = () => {
    setIsFolded(!isFolded);
  };

  return (
    <div>
      <Header 
        size='small' 
        className='filelist-header'
      >
        <Icon name={isFolded ? 'folder' : 'folder open'}
          link
          onClick={() => toggleFolded()}/>{directoryName}
      </Header>
      {!isFolded ?
        <List>
          <List.Item>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className='transferlist-selector'>
                    <Checkbox 
                      fitted 
                      checked={files.filter(f => !f.selected).length === 0}
                      onChange={(event, data) =>
                        onSelectionChange(...files.map(f => ({directory: directoryName, file: f, checked: !!data.checked})))}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell className='transferlist-filename'>File</Table.HeaderCell>
                  <Table.HeaderCell className='transferlist-progress'>Progress</Table.HeaderCell>
                  <Table.HeaderCell className='transferlist-size'>Size</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {files.sort((a, b) => getFileName(a.filename).localeCompare(getFileName(b.filename))).map((f, i) => 
                  <Table.Row key={i}>
                    <Table.Cell className='transferlist-selector'>
                      <Checkbox 
                        fitted 
                        checked={f.selected}
                        onChange={(event, data) => onSelectionChange({directory: directoryName, file: f, checked: !!data.checked})}
                      />
                    </Table.Cell>
                    <Table.Cell className='transferlist-filename'>{getFileName(f.filename)}</Table.Cell>
                    <Table.Cell className='transferlist-progress'>
                      {f.state === 'InProgress' ? 
                        <Progress 
                          style={{ margin: 0 }}
                          percent={Math.round(f.percentComplete)} 
                          progress 
                          color={getColor(f.state).color}
                        /> : 
                        <Button 
                          fluid 
                          size='mini' 
                          style={{ margin: 0, padding: 7, cursor: f.direction === 'Upload' ? 'unset' : '' }} 
                          {...getColor(f.state)} 
                          onClick={() => handleClick(f)}
                          active={f.direction === 'Upload'}
                        >
                          {f.direction === 'Download' && isQueuedState(f.state) && <Icon name='refresh'/>}
                          {f.direction === 'Download' && isRetryableState(f.state) && <Icon name='redo'/>}
                          {f.state}{f.placeInQueue ? ` (#${f.placeInQueue})` : ''}
                        </Button>}
                    </Table.Cell>
                    <Table.Cell className='transferlist-size'>
                      {formatBytesTransferred({ transferred: f.bytesTransferred, size: f.size })}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </List.Item>
        </List>
        : ''}
    </div>
  );
};

export default TransferList;
