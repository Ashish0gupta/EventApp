import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Image, Linking, ScrollView} from 'react-native';
import axios from 'axios';

const App = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  // Send OTP API
  const sendOtp = async () => {
    try {
      setErrorMessage('');
      await axios.post('https://guest-event-app.onrender.com/api/send-otp', { mobile });
      setIsOtpSent(true);
    } catch (error) {
      setErrorMessage('Error sending OTP. Please try again later.');
      console.error('Error sending OTP:', error);
    }
  };

  // Verify OTP API
  const verifyOtp = async () => {
    try {
      setErrorMessage('');
      await axios.post('https://guest-event-app.onrender.com/api/Verify-Otp', { mobile, Otp: otp });
      setIsAuthenticated(true);
    } catch (error) {
      setErrorMessage('Invalid OTP. Please try again.');
      console.error('Error verifying OTP:', error);
    }
  };

  // Fetch events for Home Page
  const fetchEvents = async () => {
    try {
      const response = await axios.post(
        'https://guest-event-app.onrender.com/api/Upcomingevent',
        {}, // Ensure this matches the required API request body
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data && response.data.Data) {
        setEvents(response.data.Data); // Access the "Data" field
      } else {
        console.error('No events found in the response.');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  // Fetch event details
  const fetchEventDetails = async (EventUUID) => {
    try {
      const response = await axios.post(
        'https://guest-event-app.onrender.com/api/eventdetailsbyuuid',
        { EventUUID }, 
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data) {
        console.log("Fetched Event Details:", response.data); // Log full response
        setSelectedEvent(response.data);
      } else {
        console.error('No event details found in the response.');
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };
  
  

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sign-In</Text>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {!isOtpSent ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
            <Button title="Send OTP" onPress={sendOtp} />
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
            <Button title="Verify OTP" onPress={verifyOtp} disabled={!otp} />
          </>
        )}
      </View>
    );
  }
  if (isAuthenticated) {
    console.log(selectedEvent);
    if (selectedEvent && selectedEvent.Data && selectedEvent.Data.length > 0) {
      const event = selectedEvent.Data[0];  // Access the first event in the array
      
      console.log("Selected Event Data:", event);  // Debugging log
      
      const eventDetails = event.EventDetails || "No description available.";
      const eventName = event.EventName || "No name available.";
      const eventImage = event.EventImage || "https://via.placeholder.com/150"; // Placeholder if image is missing
      const eventVenue = event.EventVenue || "Venue not provided";
      const eventDates = event.EventStartDate && event.EventEndDate
        ? `${new Date(event.EventStartDate).toLocaleDateString()} - ${new Date(event.EventEndDate).toLocaleDateString()}`
        : "Dates not available";
      const eventCity = event.EventCity || "City not provided";
      const eventMapLink = event.EventMapLink || "#";
    
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Event Details</Text>
          {/* Event Image */}
          <ScrollView style={styles.detailsContainer}>
          <Image source={{ uri: eventImage }} style={styles.eventImage} />
          {/* Event Name */}
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Event Name:</Text> {eventName}
          </Text>
          {/* Event Description */}
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Description:</Text> {eventDetails}
          </Text>
          {/* Event Venue */}
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Venue:</Text> {eventVenue}
          </Text>
          {/* Event Dates */}
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Date:</Text> {eventDates}
          </Text>
          {/* Event City */}
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>City:</Text> {eventCity}
          </Text>
          {/* Event Map Link */}
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Event Map:</Text>
            <TouchableOpacity onPress={() => Linking.openURL(eventMapLink)}>
              <Text style={styles.link}>View on Map</Text>
            </TouchableOpacity>
          </Text>
          </ScrollView>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedEvent(null)}>
            <Text style={styles.backButtonText}>Back to Events</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Upcoming Events</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item.EventUUID}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => fetchEventDetails(item.EventUUID)}>
              <View style={styles.eventCard}>
                <Text style={styles.eventItem}>{item.EventName}</Text>
                <Text style={styles.eventDetails}>
                  Organizer: {item.EventOrganizer}
                </Text>
                <Text style={styles.eventDetails}>City: {item.EventCity}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 13,
    backgroundColor: '#d3d3d3',
    justifyContent: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  eventCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  eventItem: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    color: '#555',
  },
  detailText: {
    fontSize: 16,
    marginVertical: 8,
  },
  eventImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default App;
