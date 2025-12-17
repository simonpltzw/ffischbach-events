export class ParticipantOut {
    constructor(
        public encryptedData: string,
        public id: number,
        public vip?: boolean
    ) {}
}