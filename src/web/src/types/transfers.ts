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

export type TransferState = "Requested" | "Queued, Remotely" | "Queued, Locally" | "Initializing" | "InProgress" 
    | "Completed, Succeeded" | "Completed, Cancelled" | "Completed, TimedOut" | "Completed, Errored" | "Completed, Rejected"