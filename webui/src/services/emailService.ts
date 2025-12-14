import useClientFetch from "./fetch";
import { Group } from "@/models/in/Group";

export const useEmail = () => {
  const { post } = useClientFetch();

  const sendApprovalEmail = async (group: Group) => {
    return await post(`/Groups/${group.id}/SendApproval`, group);
  };

  const sendRegistrationEmail = async (groupId: string) => {
    return await post(`/Groups/${groupId}/SendRegistration`);
  };

  const sendTestApprovalEmail = async (eventId: string) => {
    return await post(`/Events/${eventId}/SendTestApprovalMail`);
  };

  const sendTestRegistrationEmail = async (eventId: string) => {
    return await post(`/Events/${eventId}/SendTestRegistrationMail`);
  };

  return {
    sendApprovalEmail,
    sendRegistrationEmail,
    sendTestApprovalEmail,
    sendTestRegistrationEmail,
  };
};
