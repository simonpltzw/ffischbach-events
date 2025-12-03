import { Group } from "@/models/in/Group";
import { decryptKeyWithPassword } from "./passwordService";
import { PrivateKeyService } from "./privateKeyService";
import { Participant } from "@/models/in/Participant";
import { Event } from "@/models/in/Event";
import { ParticipantOut } from "@/models/out/ParticipantOut";

export const decryptEvent = async (
  state: Event,
  password: string,
): Promise<Group[]> => {
  const privateKey = await decryptKeyWithPassword(
    state.encryptedPrivateKey,
    password,
  );
  const key: CryptoKey = await PrivateKeyService.importPrivateKey(privateKey);

  return await Promise.all(
    state.groups!.map(async (group) => {
      const decryptedGroupName = await PrivateKeyService.decryptData(
        key,
        group.encryptedName!,
      );

      group.name = decryptedGroupName;

      const decryptedContactJson = await PrivateKeyService.decryptData(
        key,
        group.contact.encryptedData!,
      );
      const decryptedContact = JSON.parse(decryptedContactJson);
      group.contact = decryptedContact;

      return group;
    }),
  );
};

export const decryptGroup = async (
  groupState: Group,
  options: { password?: string; privateKey?: string },
): Promise<Group> => {
  let privateKey;

  if (options.password) {
    privateKey = await decryptKeyWithPassword(
      groupState.event!.encryptedPrivateKey,
      options.password,
    );
  } else if (options.privateKey) {
    privateKey = options.privateKey;
  } else {
    throw new Error("Sum ting wong");
  }

  const key: CryptoKey = await PrivateKeyService.importPrivateKey(privateKey);

  const decryptedName = await PrivateKeyService.decryptData(
    key,
    groupState.encryptedName!,
  );
  const contact = groupState.contact;

  const decryptedContact = JSON.parse(
    await PrivateKeyService.decryptData(key, groupState.contact.encryptedData!),
  ) as Participant;

  const adaptedContact: Participant = new Participant(
    contact.id,
    decryptedContact.Email,
    decryptedContact.FirstName,
    decryptedContact.LastName,
    decryptedContact.BirthDate,
    contact.vip,
    contact.createdAt,
  );

  const decryptedParticipants = await Promise.all(
    groupState.participants.map(async (participant: Participant) => {
      const decryptedParticipant: Participant = JSON.parse(
        await PrivateKeyService.decryptData(key, participant.encryptedData!),
      );

      const adaptedContact: Participant = new Participant(
        participant.id,
        decryptedParticipant.Email,
        decryptedParticipant.FirstName,
        decryptedParticipant.LastName,
        decryptedParticipant.BirthDate,
        participant.vip,
        participant.createdAt,
      );

      return adaptedContact;
    }),
  );

  const updatedGroup: Group = {
    ...groupState,
    name: decryptedName,
    contact: {
      ...groupState.contact,
      ...adaptedContact,
    },
    participants: decryptedParticipants,
  };

  return updatedGroup;
};

export const decryptParticipant = async (
  participant: ParticipantOut,
  password: string,
  encPrivateKey: string,
): Promise<Participant> => {
  const privateKey = await decryptKeyWithPassword(encPrivateKey, password);

  const key: CryptoKey = await PrivateKeyService.importPrivateKey(privateKey);

  const decryptedParticipants = JSON.parse(
    await PrivateKeyService.decryptData(key, participant.encryptedData ?? ""),
  ) as Participant;

  const adaptedParticipant: Participant = new Participant(
    decryptedParticipants.id,
    decryptedParticipants.Email,
    decryptedParticipants.FirstName,
    decryptedParticipants.LastName,
    decryptedParticipants.BirthDate,
    decryptedParticipants.vip,
    decryptedParticipants.createdAt,
  );

  return adaptedParticipant;
};
