import React, { Component, useMemo, useRef, useState } from 'react';
import * as transfers from '../../lib/transfers';

import {
  Card,
  Button,
  Icon,
} from 'semantic-ui-react';

import TransferList from './TransferList';

const TransferGroup = ({user, direction}) => {

  const [selections, setSelections] = useState(new Set());
  const [isFolded, setIsFolded] = useState(false);

  const onSelectionChange = (...args) => {
    const newSelections = new Set([...selections]);
    args.forEach(a => {
      const obj = JSON.stringify({ directory: a.directory, filename: a.file.filename });
      a.checked ? newSelections.add(obj) : newSelections.delete(obj);
    })

    setSelections(newSelections);
  };

  const isSelected = (directoryName, file) => 
    selections.has(JSON.stringify({ directory: directoryName, filename: file.filename }));

  const removeFileSelection = (file) => {

    const match = Array.from(selections)
      .map(s => JSON.parse(s))
      .find(s => s.filename === file.filename);

    if (match) {
      const newSelections = new Set([...selections]);
      newSelections.delete(JSON.stringify(match));
      setSelections(newSelections);
    }
  };

  const retryAll = async (selected) => {
    await Promise.all(selected.map(file => retry(file)));
  };

  const cancelAll = async (direction, username, selected) => {
    await Promise.all(selected.map(file => transfers.cancel({ direction, username, id: file.id})));
  };

  const removeAll = async (direction, username, selected) => {
    await Promise.all(selected.map(file => 
      transfers.cancel({ direction, username, id: file.id, remove: true })
        .then(() => removeFileSelection(file))));
  };

  const retry = async (file) => {
    const { username, filename, size } = file;
        
    try {
      await transfers.download({username, files: [{filename, size}] });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPlaceInQueue = async (file) => {
    const { username, id } = file;

    try {
      await transfers.getPlaceInQueue({ username, id });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFolded = () => {
    setIsFolded(!isFolded);
  };

  const selected = useMemo(() => {
    
    return [...selections]
      .map(s => JSON.parse(s))
      .map(s => user
        .directories
        .find(d => d.directory === s.directory)?.files
        .find(f => f.filename === s.filename)
      )
      .filter(s => s !== undefined);
  }, [selections])
  const all = selected.length > 1 ? ' Selected' : '';
      
  const allRetryable = selected.filter(f => transfers.isStateRetryable(f?.state)).length === selected.length;
  const anyCancellable = selected.filter(f => transfers.isStateCancellable(f?.state)).length > 0;
  const allRemovable = selected.filter(f => transfers.isStateRemovable(f?.state)).length === selected.length;

  return (
    <Card key={user.username} className='transfer-card' raised>
      <Card.Content>
        <Card.Header>
          <Icon
            link
            name={isFolded ? 'chevron right' : 'chevron down'}
            onClick={() => toggleFolded()}
          />
          {user.username}
        </Card.Header>
        {user.directories && !isFolded && user.directories
          .map((dir, index) => 
            <TransferList 
              key={index} 
              username={user.username} 
              directoryName={dir.directory}
              files={(dir.files || []).map(f => ({ ...f, selected: isSelected(dir.directory, f) }))}
              onSelectionChange={onSelectionChange}
              direction={direction}
              onPlaceInQueueRequested={fetchPlaceInQueue}
              onRetryRequested={retry}
            />
          )}
      </Card.Content>
      {selected && selected.length > 0 && 
              <Card.Content extra>
                {<Button.Group>
                  {allRetryable && 
                      <Button 
                        icon='redo' 
                        color='green' 
                        content={`Retry${all}`} 
                        onClick={() => retryAll(selected)}
                      />}
                  {allRetryable && anyCancellable && <Button.Or/>}
                  {anyCancellable && 
                      <Button 
                        icon='x'
                        color='red'
                        content={`Cancel${all}`}
                        onClick={() => cancelAll(direction, user.username, selected)}
                      />}
                  {(allRetryable || anyCancellable) && allRemovable && <Button.Or/>}
                  {allRemovable && 
                      <Button 
                        icon='trash alternate'
                        content={`Remove${all}`}
                        onClick={() => removeAll(direction, user.username, selected)}
                      />}
                </Button.Group>}
              </Card.Content>}
    </Card>
  );
};

export default TransferGroup;
