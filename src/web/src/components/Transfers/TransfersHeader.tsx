import React, { useState, useMemo } from 'react';

import {
  Segment,
  Icon,
} from 'semantic-ui-react';

import {
  Div,
  Nbsp,
} from '../Shared';

import ShrinkableDropdownButton from '../Shared/ShrinkableDropdownButton';
import { isStateCancellable, isStateRetryable } from '../../lib/transfers';
import { Direction, TransferFile, TransferState, UserTransfers } from '../../types/transfers';

const getRetryableFiles = (files: TransferFile[], retryOption: RetryOption) => {
  switch (retryOption) {
  case RetryOption.ERRORED:
    return files.filter(file => 
      ['Completed, TimedOut', 
        'Completed, Errored', 
        'Completed, Rejected'].includes(file.state));
  case RetryOption.CANCELLED:
    return files.filter(file => file.state === 'Completed, Cancelled');
  case RetryOption.ALL:
    return files.filter(file => isStateRetryable(file.state));
  }
};

const getCancellableFiles = (files: TransferFile[], cancelOption: CancelOption) => {
  switch (cancelOption) {
  case CancelOption.ALL:
    return files.filter(file => isStateCancellable(file.state));
  case CancelOption.QUEUED:
    return files.filter(file => [TransferState.QUEUED_LOCALLY, TransferState.QUEUED_REMOTELY].includes(file.state));
  case CancelOption.IN_PROGRESS:
    return files.filter(file => file.state === TransferState.INPROGRESS);
  }
};

const getRemovableFiles = (files: TransferFile[], removeOption: RemoveOption) => {
  switch (removeOption) {
  case RemoveOption.SUCCEEDED:
    return files.filter(file => file.state === TransferState.COMPLETED_SUCCEEDED);
  case RemoveOption.ERRORED:
    return files.filter(file => 
      [TransferState.COMPLETED_TIMEDOUT, 
        TransferState.COMPLETED_ERRORED, 
        TransferState.COMPLETED_REJECTED].includes(file.state));
  case RemoveOption.CANCELLED:
    return files.filter(file => file.state === TransferState.COMPLETED_CANCELLED);
  case RemoveOption.COMPLETED:
    return files.filter(file => file.state.includes('Completed'));
  }
};

enum RetryOption {
  ERRORED = "Errored",
  CANCELLED = "Cancelled",
  ALL = 'All',
}

enum RemoveOption {
  SUCCEEDED = "Succeeded",
  ERRORED = "Errored",
  CANCELLED = "Cancelled",
  COMPLETED = "Completed"
}

enum CancelOption {
  ALL = 'All',
  QUEUED = 'Queued',
  IN_PROGRESS = 'In Progress'
}

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
}: TransfersHeaderParams) => {
  const [removeOption, setRemoveOption] = useState(RemoveOption.SUCCEEDED);
  const [cancelOption, setCancelOption] = useState(CancelOption.ALL);
  const [retryOption, setRetryOption] = useState(RetryOption.ERRORED);

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

  const empty = files.length === 0;
  const working = retrying || cancelling || removing;

  return (
    <Segment className='transfers-header-segment' raised>
      <Div className="transfers-segment-icon"><Icon name={direction} size="big"/></Div>
      <Div hidden={empty} className="transfers-header-buttons">
        <ShrinkableDropdownButton
          hidden={direction === 'upload'}
          color='green'
          icon='redo'
          mediaQuery='(max-width: 715px)'
          onClick={() => onRetryAll(getRetryableFiles(files, retryOption))}
          disabled={working || empty || !server.isConnected}
          loading={retrying}
          options={[
            { key: 'errored', text: RetryOption.ERRORED, value: RetryOption.ERRORED },
            { key: 'cancelled', text: RetryOption.CANCELLED, value: RetryOption.CANCELLED },
            { key: 'all', text: RetryOption.ALL, value: RetryOption.ALL },
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
            { key: 'all', text: CancelOption.ALL, value: CancelOption.ALL },
            { key: 'queued', text: CancelOption.QUEUED, value: CancelOption.QUEUED },
            { key: 'inProgress', text: CancelOption.IN_PROGRESS, value: CancelOption.IN_PROGRESS },
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
            { key: 'succeeded', text: RemoveOption.SUCCEEDED, value: RemoveOption.SUCCEEDED },
            { key: 'errored', text: RemoveOption.ERRORED, value: RemoveOption.ERRORED },
            { key: 'cancelled', text: RemoveOption.CANCELLED, value: RemoveOption.CANCELLED },
            { key: 'completed', text: RemoveOption.COMPLETED, value: RemoveOption.COMPLETED },
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