import React, { useState, useEffect, useMemo } from 'react';
import * as transfersLib from '../../lib/transfers';
import { toast } from 'react-toastify';

import TransferGroup from './TransferGroup';
import TransfersHeader from './TransfersHeader';

import {LoaderSegment, PlaceholderSegment} from '../Shared';

import './Transfers.css';
import { UserTransfers, TransferFile, Direction } from '../../types/transfers';

export interface TransfersProps {
  direction: Direction,
  server: {
    isConnected: boolean
  }
}

const Transfers = ({ direction, server }: TransfersProps) => {
  const [connecting, setConnecting] = useState(true);
  const [transfers, setTransfers] = useState<UserTransfers[]>([]);

  const [retrying, setRetrying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    setConnecting(true);

    const init = async () => {
      await fetch();
      setConnecting(false);
    };

    init();
    const interval = window.setInterval(fetch, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [direction]); // eslint-disable-line react-hooks/exhaustive-deps

  useMemo(() => {
    // this is used to prevent weird update issues if switching
    // between uploads and downloads.  useEffect fires _after_ the
    // prop 'direction' updates, meaning there's a flash where the 
    // screen contents switch to the new direction for a brief moment
    // before the connecting animation shows.  this memo fires the instant
    // the direction prop changes, preventing this flash.
    setConnecting(true);
  }, [direction]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetch = async () => {
    try {
      const response = await transfersLib.getAll({ direction });
      if (response) setTransfers(response);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data ?? error?.message ?? error);
    }
  };

  const retry = async ({ file, suppressStateChange = false }: {file: TransferFile, suppressStateChange: boolean}) => {
    const { username, filename, size } = file;
        
    try {
      if (!suppressStateChange) setRetrying(true);
      await transfersLib.download({username, files: [{filename, size}] });
      if (!suppressStateChange) setRetrying(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data ?? error?.message ?? error);
      if (!suppressStateChange) setRetrying(false);
    }
  };

  const retryAll = async (transfers: TransferFile[]) => {
    setRetrying(true);
    await Promise.all(transfers.map(file => retry({ file, suppressStateChange: true })));
    setRetrying(false);
  };

  const cancel = async (file: TransferFile, suppressStateChange = false) => {
    const { username, id } = file;
    
    try {
      if (!suppressStateChange) setCancelling(true);
      await transfersLib.cancel(direction, username, id);
      if (!suppressStateChange) setCancelling(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data ?? error?.message ?? error);
      if (!suppressStateChange) setCancelling(false);
    }
  };

  const cancelAll = async (transfers: TransferFile[]) => {
    setCancelling(true);
    await Promise.all(transfers.map(file => cancel(file, true)));
    setCancelling(false);
  };

  const remove = async (file: TransferFile, suppressStateChange = false) => {
    const { username, id } = file;

    try {
      if (!suppressStateChange) setRemoving(true);
      await transfersLib.cancel(direction, username, id, true);
      if (!suppressStateChange) setRemoving(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data ?? error?.message ?? error);
      if (!suppressStateChange) setRemoving(false);
    }
  };

  const removeAll = async (transfers: TransferFile[]) => {
    setRemoving(true);
    await Promise.all(transfers.map(file => remove(file, true)));
    setRemoving(false);
  };

  if (connecting) {
    return <LoaderSegment/>;
  }

  return (
    <>
      <TransfersHeader 
        direction={direction} 
        transfers={transfers} 
        server={server}
        onRetryAll={retryAll}
        retrying={retrying}
        onCancelAll={cancelAll}
        cancelling={cancelling}
        onRemoveAll={removeAll}
        removing={removing}
      />
      {transfers.length === 0 
        ? <PlaceholderSegment icon={direction} caption={`No ${direction}s to display`}/>
        : transfers.map((user, index) => 
          <TransferGroup 
            key={index} 
            direction={direction} 
            user={user}
          />
        )}
    </>
  );
};

export default Transfers;