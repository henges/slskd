export type Direction = "download" | "upload"

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
    direction:        string;
    filename:         string;
    size:             number;
    startOffset:      number;
    state:            string;
    requestedAt:      Date;
    endedAt:          Date;
    bytesTransferred: number;
    averageSpeed:     number;
    exception:        string;
    bytesRemaining:   number;
    percentComplete:  number;
}
