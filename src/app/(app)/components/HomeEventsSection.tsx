"use client";

import { Event } from "@/payload-types";
import { fetchEvents } from "../(pages)/events/actions";
import { useEffect, useState } from "react";
import { EventCard } from "../(pages)/events/components/EventCard";
import { EventCardSkeleton } from "../(pages)/events/components/EventCardSkeleton";

export default function HomeEventsSection() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [eventType, setEventType] = useState<"ongoing" | "upcoming">("upcoming");

    useEffect(() => {
        // first try to fetch ongoing events
        fetchEvents("ongoing")
            .then((ongoingEvents) => {
                if (ongoingEvents && ongoingEvents.length > 0) {
                    // if there are ongoing events, use them
                    setEvents(ongoingEvents);
                    setEventType("ongoing");
                } else {
                    // if no ongoing events, try to fetch upcoming events
                    return fetchEvents("upcoming").then((upcomingEvents) => {
                        if (upcomingEvents && upcomingEvents.length > 0) {
                            setEvents(upcomingEvents);
                            setEventType("upcoming");
                        }
                    });
                }
            })
            .catch((error) => {
                console.error("Error fetching events:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []); // only fetch on mount

    if (!events.length && !isLoading) {
        return null; // don't show the section if no events are available
    }

    const variant = eventType === "ongoing" ? "featured" : "default";

    return (
        <>
            <h2 className="text-center text-3xl font-bold md:text-4xl">{eventType === "ongoing" ? "Ongoing Events" : "Upcoming Events"}</h2>
            <p className="mb-8 mt-3 text-center text-xl font-medium text-cTextOffset md:px-20 lg:px-28">{eventType === "ongoing" ? "We're hosting an event RIGHT NOW! Come join us for a moment of relaxation, connection, and mental wellness. This is your chance to recharge, learn, and engage with others in a supportive environment. Don't miss out—take a step toward nurturing your well-being with us today!" : "View MindVista's upcoming wellness events at McGill University! Engage in activities that promote mental health and well-being, and stay connected to our supportive student community."}</p>
            <div className="mx-auto max-w-4xl">
                <div className="flex flex-col gap-6 px-6">
                    {isLoading ? (
                        <>
                            <EventCardSkeleton variant="default" /> <EventCardSkeleton variant="default" />
                        </>
                    ) : (
                        events.map((event) => <EventCard key={event.id} event={event} variant={variant} />)
                    )}
                </div>
            </div>
        </>
    );
}
