export interface Page {}

export interface EventListPage extends Page {
    eventFilter: string;
    finished: boolean
}

export interface EventPage extends Page {
    groupFilter: string;
    approved: boolean
}

export interface FilterSettings {
    eventList?: EventListPage;
    eventDetail?:  EventPage;
}