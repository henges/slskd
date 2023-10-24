export type Direction = "download" | "upload"

export type ApiDirection = "Download" | "Upload"

export interface UserTransfers {
    username:    string;
    directories: TransferDirectory[];
}

export interface TransferDirectory {
    directory: string;
    fileCount: number;
    files:     TransferFile[];
}

export interface FileDownloadRequest { 
    username: string, 
    files: Pick<TransferFile, "filename" | "size">[] 
}

export interface TransferFile {
    id:               string;
    username:         string;
    direction:        ApiDirection;
    filename:         string;
    size:             number;
    startOffset:      number;
    state:            TransferState;
    requestedAt:      Date;
    endedAt:          Date;
    bytesTransferred: number;
    averageSpeed:     number;
    exception:        string;
    bytesRemaining:   number;
    percentComplete:  number;
}

export enum TransferState {
    REQUESTED = 'Requested',
    QUEUED_REMOTELY = 'Queued, Remotely',
    QUEUED_LOCALLY = 'Queued, Locally',
    INITIALIZING = 'Initializing',
    INPROGRESS = 'InProgress',
    COMPLETED_SUCCEEDED = 'Completed, Succeeded',
    COMPLETED_CANCELLED = 'Completed, Cancelled',
    COMPLETED_TIMEDOUT = 'Completed, TimedOut',
    COMPLETED_ERRORED = 'Completed, Errored',
    COMPLETED_REJECTED = 'Completed, Rejected',
}