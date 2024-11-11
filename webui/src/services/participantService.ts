import { ParticipantOut } from "@/models/out/ParticipantOut";
import { ParticipantEdit } from "@/models/out/ParticipantEdit";
import useClientFetch from "./fetch";

export const useParticipantService = () => {
  const {get, getOne, post, put, _delete} = useClientFetch()

  const addParticipant = async (
    newParticipant: ParticipantEdit,
  ): Promise<ParticipantOut> => {
    return post(`/Participants?isContact=false`, newParticipant)
  };

  const addContact = async (
    newParticipant: ParticipantEdit,
  ): Promise<ParticipantOut> => {
    return post(`/Participants?isContact=true`, newParticipant)
  };

  return {
    addParticipant,
    addContact
  }
};
