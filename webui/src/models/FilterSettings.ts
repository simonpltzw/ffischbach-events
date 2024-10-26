export interface Page {}

export interface EventListPage extends Page {
    eventFilter: string;
    eventFilterEnded: string;
}

export interface EventPage extends Page {
    groupFilter: string;
    groupFilterApproved: string;
}

export interface FilterSettings {
    eventList?: EventListPage;
    eventDetail?:  EventPage;
}