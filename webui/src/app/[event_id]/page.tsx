"use client";

import { useEffect, useReducer } from "react";
import { useMsal } from "@azure/msal-react";
import { test_data } from "../../assets/test";
import { useRouter } from "next/navigation";
import { ToggleButton } from "@/components/ToggleButton";
import { useGroupContext } from "@/context/group";
import { Group } from "@/models/in/Group";

const EventPage = ({ params }: { params: { event_id: string } }) => {
  const reducer = (state: any, action: any): any => {
    if (action.type === "updateApproved") {
      const groups: Group[] = state.groups;
      groups[action.index].approved = action.value;
    }
    return state;
  };

  const { instance, accounts } = useMsal();
  const router = useRouter();
  const [group, setGroup] = useGroupContext()
  const [state, dispatch] = useReducer(reducer, null, () => {
    //const result: AuthenticationResult | undefined = await getToken(instance, accounts[0])

    /*
      if (result) {
        getEventById(result!.accessToken, params.event_id).then((event) => {
          setCurrentEvent(event);
        });
      }
      */

    return test_data[0];
  });

  useEffect(() => {}, [accounts, instance, params.event_id]);

  const getLocalDateTime = (dateStr: string): string => {
    const date: Date = new Date(dateStr);
    return `${date.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const generateGroupEntry = (group: Group, index: number) => {
    return (
      <div key={`event-group-${index}`} className="grid grid-cols-subgrid col-span-6 gap-3 ">
        <div>{group.name}</div>
        <div>{group.category}</div>
        <div>
          <div className="mr-3">{"undefined"}</div>
          <div>{"undefined"}</div>
        </div>
        <div>
          <ToggleButton index={index} dispatch={dispatch} />
        </div>
        <div>{getLocalDateTime(group.createdAt)}</div>
        <div
          className="ml-10 p-3 bg-gray-700 h-fit w-fit rounded-md cursor-pointer"
          onClick={() => {
            //setGroup({type: group.})
            router.push(`/${state.id}/${state.groups[index].name}`);
          }}
        ></div>
      </div>
    );
  };

  return (
      <div className="relative w-full h-full mx-auto">
        <div className="flex pt-5 justify-center">
          <div className="flex flex-col gap-10">
            <div className="flex-inline gap-3">
              <div>Event Name: </div>
              <h3 className="text-base font-semibold">{state?.id}</h3>
            </div>
            <div className="flex-inline gap-3">
              <div>Beschreibung:</div>
              <div className="text-base font-semibold">{state?.description}</div>
            </div>
            <div
              className="grid grid-cols-6 gap-3 overflow-y-scroll max-h-32 -mr-[20px] pr-[20px]"
              style={{ clipPath: "inset(0 20px 0 0)" }}
            >
              <div className="font-bold col-span-6">Gruppen</div>
              <div>Name</div>
              <div>Kategorie</div>
              <div>Kontakt</div>
              <div>Genehmigt</div>
              <div>Erstellt</div>

              {state.groups.map((group: Group, index: number) => generateGroupEntry(group, index))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default EventPage;
