import React, { useState, useMemo } from 'react';

import {
  Segment,
  Icon,
} from 'semantic-ui-react';

import {
  Div,
  Nbsp,
  ShrinkableButton,
} from '../Shared';

import ShrinkableDropdownButton from '../Shared/ShrinkableDropdownButton';
import { isStateCancellable, isStateRetryable } from '../../lib/transfers';
import { Direction, TransferErrorStates, TransferFile, TransferQueuedStates, UserTransfers } from '../../types/transfers';
import { FileFilterOption } from './Transfers';
import { callMetadataSyncer } from '../../lib/metadata-syncer';

type RetryOption = "Errored" | "Cancelled" | "All"

type RemoveOption = "Succeeded" | "Errored" | "Cancelled" | "Completed"

type CancelOption = "All" | "Queued" | "In Progress"

const getRetryableFiles = (files: TransferFile[], retryOption: RetryOption) => {
  switch (retryOption) {
  case "Errored":
    return files.filter(file => !!TransferErrorStates.find(s => s === file.state));
  case "Cancelled":
    return files.filter(file => file.state === 'Completed, Cancelled');
  case "All":
    return files.filter(file => isStateRetryable(file.state));
  }
};

const getCancellableFiles = (files: TransferFile[], cancelOption: CancelOption) => {
  switch (cancelOption) {
  case "All":
    return files.filter(file => isStateCancellable(file.state));
  case "Queued":
    return files.filter(file => ["Queued, Locally", "Queued, Remotely"].includes(file.state));
  case "In Progress":
    return files.filter(file => file.state === "InProgress");
  }
};

const getRemovableFiles = (files: TransferFile[], removeOption: RemoveOption) => {
  switch (removeOption) {
  case "Succeeded":
    return files.filter(file => file.state === "Completed, Succeeded");
  case "Errored":
    return files.filter(file => 
      ["Completed, TimedOut", 
        "Completed, Errored", 
        "Completed, Rejected"].includes(file.state));
  case "Cancelled":
    return files.filter(file => file.state === "Completed, Cancelled");
  case "Completed":
    return files.filter(file => file.state.includes('Completed'));
  }
};

export interface TransfersHeaderParams {
  direction: Direction, 
  transfers: UserTransfers[], 
  server: {
    isConnected: boolean
  }, 
  onRetryAll: (transfers: TransferFile[]) => Promise<void>,
  retrying: boolean,
  onCancelAll: (transfers: TransferFile[]) => Promise<void>,
  cancelling: boolean, 
  onRemoveAll: (transfers: TransferFile[]) => Promise<void>,
  removing: boolean,
  fileFilter: FileFilterOption,
  onChangeFileFilter: (f: FileFilterOption) => void,
}

const TransfersHeader = ({ 
  direction, 
  transfers, 
  server = { isConnected: true }, 
  onRetryAll,
  retrying = false,
  onCancelAll,
  cancelling = false, 
  onRemoveAll,
  removing = false,
  fileFilter,
  onChangeFileFilter
}: TransfersHeaderParams) => {
  const [removeOption, setRemoveOption] = useState<RemoveOption>("Succeeded");
  const [cancelOption, setCancelOption] = useState<CancelOption>("All");
  const [retryOption, setRetryOption] = useState<RetryOption>("Errored");
  const [callingSyncer, setCallingSyncer] = useState<boolean>(false);

  const files = useMemo(() => {
    const files = transfers.reduce((acc: TransferFile[], username) => {
      const allUserFiles = username.directories.reduce((acc: TransferFile[], directory) => {
        acc = acc.concat(directory.files);
        return acc;
      }, []);
    
      acc = acc.concat(allUserFiles);
      return acc;
    }, []);

    return files.filter(file => file.direction.toLowerCase() === direction);
  }, [transfers, direction]);  

  const callSyncer = async () => {
    setCallingSyncer(true);
    await callMetadataSyncer();
    setCallingSyncer(false);
  }

  const empty = files.length === 0;
  const working = retrying || cancelling || removing;

  return (
    <Segment className='transfers-header-segment' raised>
      <Div className="transfers-segment-icon"><Icon name={direction} size="big"/></Div>
      <Div hidden={empty} className="transfers-header-buttons">
        <ShrinkableButton
          icon='refresh'
          mediaQuery='(max-width: 715px)'
          disabled={callingSyncer || working || empty}
          loading={callingSyncer}
          onClick={() => callSyncer()}
        >
          Call metadata-syncer
        </ShrinkableButton>
        <ShrinkableDropdownButton
          icon='filter'
          mediaQuery='(max-width: 715px)'
          onClick={() => null}
          disabled={working || empty}
          loading={removing}
          options={[
            { key: 'all', text: "All", value: "ALL" },
            { key: 'succeeded', text: "Succeeded", value: "SUCCEEDED" },
            { key: 'in_progress', text: "In Progress", value: "IN_PROGRESS" },
            { key: 'errored', text: "Errored", value: "ERRORED" },
            { key: 'incomplete', text: "Incomplete", value: "INCOMPLETE" },
          ]}
          onChange={(_, data) => onChangeFileFilter(data.value as FileFilterOption)}
        >
          Filter (current: {fileFilter == "IN_PROGRESS" ? "in progress" : `${fileFilter.toLowerCase()}`})
        </ShrinkableDropdownButton>
        <Nbsp/>
        <ShrinkableDropdownButton
          hidden={direction === 'upload'}
          color='green'
          icon='redo'
          mediaQuery='(max-width: 715px)'
          onClick={() => onRetryAll(getRetryableFiles(files, retryOption))}
          disabled={working || empty || !server.isConnected}
          loading={retrying}
          options={[
            { key: 'errored', text: "Errored", value: "Errored" },
            { key: 'cancelled', text: "Cancelled", value: "Cancelled" },
            { key: 'all', text: "All", value: "All" },
          ]}
          onChange={(_, data) => setRetryOption(data.value as RetryOption)}
        >
          {`Retry ${retryOption === 'All' ? retryOption : `All ${retryOption}`}`}
        </ShrinkableDropdownButton>
        <Nbsp/>
        <ShrinkableDropdownButton
          color='red'
          icon='x'
          mediaQuery='(max-width: 715px)'
          onClick={() => onCancelAll(getCancellableFiles(files, cancelOption))}
          disabled={working || empty}
          loading={cancelling}
          options={[
            { key: 'all', text: "All", value: "All" },
            { key: 'queued', text: "Queued", value: "Queued" },
            { key: 'inProgress', text: "In Progress", value: "In Progress" },
          ]}
          onChange={(_, data) => setCancelOption(data.value as CancelOption)}
        >
          {`Cancel ${cancelOption === 'All' ? cancelOption : `All ${cancelOption}`}`}
        </ShrinkableDropdownButton>
        <Nbsp/>
        <ShrinkableDropdownButton
          icon='trash alternate'
          mediaQuery='(max-width: 715px)'
          onClick={() => onRemoveAll(getRemovableFiles(files, removeOption))}
          disabled={working || empty}
          loading={removing}
          options={[
            { key: 'succeeded', text: "Succeeded", value: "Succeeded" },
            { key: 'errored', text: "Errored", value: "Errored" },
            { key: 'cancelled', text: "Cancelled", value: "Cancelled" },
            { key: 'completed', text: "Completed", value: "Completed" },
          ]}
          onChange={(_, data) => setRemoveOption(data.value as RemoveOption)}
        >
          {`Remove All ${removeOption}`}
        </ShrinkableDropdownButton>
      </Div>
    </Segment>
  );
};

export default TransfersHeader;