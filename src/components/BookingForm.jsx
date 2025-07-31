// src/pages/NewBooking.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Home,
  Briefcase,
  CreditCard,
  Loader,
  Upload,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import Webcam from "react-webcam";

const BookingForm = () => {
  const { BACKEND_URL, categories } = useContext(AppContext);
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const location = useLocation();
  const reservationId = location.state?.reservationId;
  const [showCamera, setShowCamera] = useState(false);
  const [currentCameraTarget, setCurrentCameraTarget] = useState(null); // 'front' or 'back'
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [formData, setFormData] = useState({
    // Identifiers
    grcNo: "",
    bookingRefNo: "",
    reservationId: null,

    // Room & Guest Info
    categoryId: "",
    roomNumber: "",
    roomRate: 0,
    numberOfRooms: 1,
    status: "Booked",
    baseRate: 0,
    days: 1,

    // Guest Details
    guestDetails: {
      salutation: "Mr",
      name: "",
      age: "",
      gender: "Male",
      photoFile: null,
    },

    // Contact Details
    contactDetails: {
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      pinCode: "",
    },

    // Identity Details
    identityDetails: {
      idType: "",
      idNumber: "",
      idPhotoFront: "",
      idPhotoBack: "",
    },

    // Booking Info
    bookingInfo: {
      checkIn: "",
      checkOut: "",
      actualCheckInTime: "12:00",
      actualCheckOutTime: "10:00",
      arrivalFrom: "",
      bookingType: "Walk-in",
      purposeOfVisit: "",
      remarks: "",
      adults: 1,
      children: 0,
    },

    // Payment Details
    paymentDetails: {
      totalAmount: 0,
      advancePaid: 0,
      paymentMode: "Cash",
      billingName: "",
      billingAddress: "",
      gstNumber: "",
      discountPercent: 0,
    },

    // Vehicle Details
    vehicleDetails: {
      vehicleNumber: "",
      vehicleType: "",
      vehicleModel: "",
      driverName: "",
      driverMobile: "",
    },

    // Flags
    vip: false,
    isForeignGuest: false,
  });

  const calculateDaysFromDates = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const days = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 1;
  };

  useEffect(() => {
    if (reservationId) {
      const fetchReservationData = async () => {
        try {
          setInitialLoading(true);
          const response = await axios.get(
            `${BACKEND_URL}/api/reservation/${reservationId}`
          );

          if (response.data.success) {
            const reservation = response.data.reservation;
            toast.success("Reservation details loaded successfully");

            // Format dates for form inputs
            const formatDate = (dateString) => {
              if (!dateString) return "";
              return new Date(dateString).toISOString().split("T")[0];
            };

            // Map reservation data to booking form fields
            setFormData({
              grcNo: reservation.grcNo || "",
              bookingRefNo: reservation.bookingRefNo || "",
              reservationId: reservation._id,
              categoryId: reservation.category?._id || "",
              roomNumber: reservation.roomAssigned?.room_number || "",
              roomRate: reservation.rate || 0,
              numberOfRooms: reservation.noOfRooms || 1,
              status: "Booked",

              guestDetails: {
                salutation: reservation.salutation || "Mr",
                name: reservation.guestName || "",
                age: reservation.age || "",
                gender: reservation.gender || "Male",
                photoUrl: "",
              },

              contactDetails: {
                phone: reservation.phoneNo || reservation.mobileNo || "",
                email: reservation.email || "",
                address: reservation.address || "",
                city: reservation.city || "",
                state: "",
                country: reservation.nationality || "India",
                pinCode: "",
              },

              identityDetails: {
                idType: "",
                idNumber: "",
                idPhotoFront: "",
                idPhotoBack: "",
              },

              bookingInfo: {
                checkIn: formatDate(reservation.checkInDate),
                checkOut: formatDate(reservation.checkOutDate),
                actualCheckInTime: reservation.checkInTime || "12:00",
                actualCheckOutTime: reservation.checkOutTime || "10:00",
                arrivalFrom: reservation.arrivalFrom || "",
                bookingType: "Walk-in",
                purposeOfVisit: reservation.purposeOfVisit || "",
                remarks: reservation.remarks || "",
                adults: reservation.noOfAdults || 1,
                children: reservation.noOfChildren || 0,
              },

              paymentDetails: {
                totalAmount:
                  reservation.rate *
                    calculateDaysFromDates(
                      reservation.checkInDate,
                      reservation.checkOutDate
                    ) || 0,
                advancePaid: reservation.advancePaid || 0,
                paymentMode: reservation.paymentMode || "Cash",
                billingName: "",
                billingAddress: "",
                gstNumber: reservation.companyGSTIN || "",
                discountPercent: reservation.discountPercent || 0,
              },

              vehicleDetails: {
                vehicleNumber: reservation.vehicleDetails?.vehicleNumber || "",
                vehicleType: reservation.vehicleDetails?.vehicleType || "",
                vehicleModel: reservation.vehicleDetails?.vehicleModel || "",
                driverName: reservation.vehicleDetails?.driverName || "",
                driverMobile: reservation.vehicleDetails?.driverMobile || "",
              },

              vip: reservation.vip || false,
              isForeignGuest: reservation.isForeignGuest || false,
            });

            // Set category and room data
            if (reservation.category?._id) {
              setSelectedCategory(reservation.category._id);
            }

            // Create room data for the form
            if (reservation.roomAssigned) {
              const reservationRoom = {
                _id: reservation.roomAssigned._id,
                room_number: reservation.roomAssigned.room_number,
                title: reservation.roomAssigned.title,
                price: reservation.roomAssigned.price,
              };

              setFilteredRooms([reservationRoom]);
              setRooms([
                {
                  categoryId: reservation.category?._id,
                  categoryName: reservation.category?.category,
                  rooms: [reservationRoom],
                },
              ]);
            }
          }
        } catch (error) {
          console.error("Error fetching reservation:", error);
          toast.error("Failed to load reservation data");
        } finally {
          setInitialLoading(false);
        }
      };

      fetchReservationData();
    }
  }, [reservationId, BACKEND_URL]);

  // Fetch booking data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchBookingData = async () => {
        try {
          setInitialLoading(true);
          const response = await axios.get(
            `${BACKEND_URL}/api/bookings/info?bookingId=${id}`
          );

          if (response.data.success) {
            const booking = response.data.booking;

            // Convert date strings to input format (YYYY-MM-DD)
            const formatDate = (dateString) => {
              if (!dateString) return "";
              return new Date(dateString).toISOString().split("T")[0];
            };

            const formatTime = (timeString) => {
              if (!timeString) return "";
              if (timeString instanceof Date) {
                return timeString.toTimeString().slice(0, 5);
              }
              return timeString;
            };
            console.log("Total amount" + booking.paymentDetails.totalAmount);

            setFormData({
              grcNo: booking.grcNo || "",
              bookingRefNo: booking.bookingRefNo || "",
              reservationId: booking.reservationId,
              categoryId: booking.categoryId?._id || "",
              roomNumber: booking.roomNumber || "",
              roomRate: booking.roomRate || 0,
              numberOfRooms: booking.numberOfRooms || 1,
              status: booking.status || "Booked",

              guestDetails: {
                salutation: booking.guestDetails?.salutation || "Mr",
                name: booking.guestDetails?.name || "",
                age: booking.guestDetails?.age || "",
                gender: booking.guestDetails?.gender || "Male",
                photoUrl: booking.guestDetails?.photoUrl || "",
              },

              contactDetails: {
                phone: booking.contactDetails?.phone || "",
                email: booking.contactDetails?.email || "",
                address: booking.contactDetails?.address || "",
                city: booking.contactDetails?.city || "",
                state: booking.contactDetails?.state || "",
                country: booking.contactDetails?.country || "India",
                pinCode: booking.contactDetails?.pinCode || "",
              },

              identityDetails: {
                idType: booking.identityDetails?.idType || "",
                idNumber: booking.identityDetails?.idNumber || "",
                idPhotoFront: booking.identityDetails?.idPhotoFront || "",
                idPhotoBack: booking.identityDetails?.idPhotoBack || "",
              },
              idProofImageUrl: booking.identityDetails?.idPhotoFront || "",
              idProofImageUrl2: booking.identityDetails?.idPhotoBack || "",

              bookingInfo: {
                checkIn: formatDate(booking.bookingInfo?.checkIn),
                checkOut: formatDate(booking.bookingInfo?.checkOut),
                actualCheckInTime:
                  formatTime(booking.bookingInfo?.actualCheckInTime) || "12:00",
                actualCheckOutTime:
                  formatTime(booking.bookingInfo?.actualCheckOutTime) ||
                  "10:00",
                arrivalFrom: booking.bookingInfo?.arrivalFrom || "",
                bookingType: booking.bookingInfo?.bookingType || "Walk-in",
                purposeOfVisit: booking.bookingInfo?.purposeOfVisit || "",
                remarks: booking.bookingInfo?.remarks || "",
                adults: booking.bookingInfo?.adults || 1,
                children: booking.bookingInfo?.children || 0,
              },

              paymentDetails: {
                totalAmount: booking.paymentDetails?.totalAmount || 0,
                advancePaid: booking.paymentDetails?.advancePaid || 0,
                paymentMode: booking.paymentDetails?.paymentMode || "Cash",
                billingName: booking.paymentDetails?.billingName || "",
                billingAddress: booking.paymentDetails?.billingAddress || "",
                gstNumber: booking.paymentDetails?.gstNumber || "",
                discountPercent: booking.paymentDetails?.discountPercent || 0,
              },

              vehicleDetails: {
                vehicleNumber: booking.vehicleDetails?.vehicleNumber || "",
                vehicleType: booking.vehicleDetails?.vehicleType || "",
                vehicleModel: booking.vehicleDetails?.vehicleModel || "",
                driverName: booking.vehicleDetails?.driverName || "",
                driverMobile: booking.vehicleDetails?.driverMobile || "",
              },

              vip: booking.vip || false,
              isForeignGuest: booking.isForeignGuest || false,
            });
            // Set the selected category for room filtering
            if (booking.categoryId?._id) {
              setSelectedCategory(booking.categoryId._id);
            }
            // Create room data for edit mode
            if (isEditMode && booking.roomNumber) {
              const editModeRoom = {
                _id: booking._id,
                room_number: booking.roomNumber,
                title: `Room ${booking.roomNumber}`,
                price: booking.roomRate || 0,
                category: booking.categoryId,
              };

              setFilteredRooms([editModeRoom]);
              setRooms([
                {
                  categoryId: booking.categoryId?._id,
                  categoryName: booking.categoryId?.category,
                  rooms: [editModeRoom],
                },
              ]);
            }
          }
        } catch (error) {
          console.error("Error fetching booking:", error);
          toast.error("Failed to load booking data");
        } finally {
          setInitialLoading(false);
        }
      };

      fetchBookingData();
    }
  }, [id, isEditMode, BACKEND_URL]);

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (formData.bookingInfo.checkIn) {
          params.append("checkInDate", formData.bookingInfo.checkIn);
        }

        if (formData.bookingInfo.checkOut) {
          params.append("checkOutDate", formData.bookingInfo.checkOut);
        }

        const url = `${BACKEND_URL}/api/rooms/available${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const response = await axios.get(url);

        if (response.data.success) {
          setRooms(response.data.availableRooms);

          // Filter rooms based on selected category

          let categoryRooms = [];
          if (selectedCategory) {
            const categoryGroup = response.data.availableRooms.find(
              (group) => group.categoryId === selectedCategory
            );
            categoryRooms = categoryGroup ? categoryGroup.rooms : [];
          } else {
            // Show all rooms if no category selected
            categoryRooms = response.data.availableRooms.flatMap(
              (group) => group.rooms
            );
          }

          // Include the currently booked room in the filtered list
          if (formData.roomNumber) {
            const currentRoom = categoryRooms.find(
              (room) => room.room_number === formData.roomNumber
            );
            if (!currentRoom) {
              const bookedRoom = {
                _id: formData.roomNumber, // Assuming room_number is unique
                room_number: formData.roomNumber,
                title: "Currently Booked Room", // Placeholder title
                price: formData.baseRate || 0, // Use baseRate if available
              };
              categoryRooms.unshift(bookedRoom);
            }
          }

          setFilteredRooms(categoryRooms);
        }
      } catch (error) {
        console.error("Error fetching available rooms:", error);
        toast.error("Failed to load available rooms");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if NOT in edit mode AND both dates are present
    if (
      !isEditMode &&
      formData.bookingInfo.checkIn &&
      formData.bookingInfo.checkOut
    ) {
      fetchAvailableRooms();
    }
  }, [
    selectedCategory,
    formData.bookingInfo.checkIn,
    formData.bookingInfo.checkOut,
    BACKEND_URL,
    isEditMode,
  ]);

  const capturePhoto = () => {
    if (!webcamRef.current) {
      console.error("Webcam ref is not available");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      console.error("Failed to capture screenshot");
      return;
    }
    // Convert base64 to blob
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File(
          [blob],
          currentCameraTarget === "front" ? "id_front.jpg" : "id_back.jpg",
          { type: "image/jpeg" }
        );

        if (currentCameraTarget === "front") {
          setFormData((prev) => ({
            ...prev,
            identityDetails: {
              ...prev.identityDetails,
              idPhotoFront: file,
            },
            idProofImageUrl: imageSrc,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            identityDetails: {
              ...prev.identityDetails,
              idPhotoBack: file,
            },
            idProofImageUrl2: imageSrc,
          }));
        }

        setShowCamera(false);
      })
      .catch((error) => {
        console.error("Error processing captured image:", error);
      });
  };

  // Add these functions to handle camera toggling
  const openCamera = async (target) => {
    try {
      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      setCurrentCameraTarget(target);
      setShowCamera(true);
    } catch (error) {
      console.error("Camera permission denied or not available:", error);
      alert(
        "Camera access is required to take photos. Please allow camera permission and try again."
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (name === "roomNumber") {
      // Find selected room and update price
      const allRooms = rooms.flatMap((group) => group.rooms);
      const selectedRoom = allRooms.find((room) => room.room_number === value);

      if (selectedRoom) {
        const days = calculateDays();
        const newTotal = selectedRoom.price * days;

        setFormData((prev) => ({
          ...prev,
          roomNumber: value,
          baseRate: selectedRoom.price,
          roomRate: selectedRoom.price,
          paymentDetails: {
            ...prev.paymentDetails,
            totalAmount: newTotal,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          roomNumber: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      categoryId: categoryId,
      roomNumber: "", // Reset room selection when category changes
    }));
  };

  // Calculate days when check-in or check-out dates change
  useEffect(() => {
    if (formData.bookingInfo.checkIn && formData.bookingInfo.checkOut) {
      const checkIn = new Date(formData.bookingInfo.checkIn);
      const checkOut = new Date(formData.bookingInfo.checkOut);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      if (days > 0) {
        const allRooms = rooms.flatMap((group) => group.rooms);
        const selectedRoom = allRooms.find(
          (room) => room.room_number === formData.roomNumber
        );
        const baseRate = selectedRoom ? selectedRoom.price : 0;
        const newTotal = baseRate * days;

        setFormData((prev) => ({
          ...prev,
          days,
          paymentDetails: {
            ...prev.paymentDetails,
            totalAmount: newTotal,
          },
        }));
      }
    }
  }, [formData.bookingInfo.checkIn, formData.bookingInfo.checkOut]);

  // Update rate when room is selected
  // useEffect(() => {
  //   if (formData.roomNo) {
  //     const selectedRoom = rooms.find(
  //       (room) => room.number === formData.roomNo
  //     );
  //     if (selectedRoom) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         rate: selectedRoom.price,
  //       }));
  //     }
  //   }
  // }, [formData.roomNo, rooms]);

  const handleGuestPhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        photoUrl: imageUrl,
        photoFile: file,
      });
    }
  };

  const handleIdProofImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        identityDetails: {
          ...prev.identityDetails,
          idPhotoFront: file,
        },
        idProofImageUrl: imageUrl,
      }));
    }
  };

  const handleIdProofImage2Upload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        identityDetails: {
          ...prev.identityDetails,
          idPhotoBack: file,
        },
        idProofImageUrl2: imageUrl,
      }));
    }
  };

  const removeIdProofImage = (imageNum) => {
    if (imageNum === 1) {
      if (formData.idProofImageUrl) {
        URL.revokeObjectURL(formData.idProofImageUrl);
      }
      setFormData((prev) => ({
        ...prev,
        identityDetails: {
          ...prev.identityDetails,
          idPhotoFront: "",
        },
        idProofImageUrl: "",
      }));
    } else {
      if (formData.idProofImageUrl2) {
        URL.revokeObjectURL(formData.idProofImageUrl2);
      }
      setFormData((prev) => ({
        ...prev,
        identityDetails: {
          ...prev.identityDetails,
          idPhotoBack: "",
        },
        idProofImageUrl2: "",
      }));
    }
  };

  const removeGuestPhoto = () => {
    URL.revokeObjectURL(formData.photoUrl);
    setFormData({
      ...formData,
      photoUrl: "",
      photoFile: null,
    });
  };

  const handleGrcChange = async (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      grcNo: value,
    }));

    // Only fetch if GRC number has at least 4 characters
    if (value.length >= 4) {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/guests/${value}`);

        if (response.data.success) {
          const guest = response.data.guest;

          // Map guest details to booking form fields
          setFormData((prev) => ({
            ...prev,
            grcNo: value,
            bookingRefNo: guest.bookingRefNo || prev.bookingRefNo,

            guestDetails: {
              ...prev.guestDetails,
              salutation: guest.salutation || prev.guestDetails.salutation,
              name: guest.name || prev.guestDetails.name,
              age: guest.age || prev.guestDetails.age,
              gender: guest.gender || prev.guestDetails.gender,
              photoUrl: guest.photoUrl || prev.guestDetails.photoUrl,
            },

            contactDetails: {
              ...prev.contactDetails,
              phone: guest.contactDetails?.phone || prev.contactDetails.phone,
              email: guest.contactDetails?.email || prev.contactDetails.email,
              address:
                guest.contactDetails?.address || prev.contactDetails.address,
              city: guest.contactDetails?.city || prev.contactDetails.city,
              state: guest.contactDetails?.state || prev.contactDetails.state,
              country:
                guest.contactDetails?.country || prev.contactDetails.country,
              pinCode:
                guest.contactDetails?.pinCode || prev.contactDetails.pinCode,
            },

            identityDetails: {
              ...prev.identityDetails,
              idType:
                guest.identityDetails?.idType || prev.identityDetails.idType,
              idNumber:
                guest.identityDetails?.idNumber ||
                prev.identityDetails.idNumber,
              idPhotoFront:
                guest.identityDetails?.idPhotoFront ||
                prev.identityDetails.idPhotoFront,
              idPhotoBack:
                guest.identityDetails?.idPhotoBack ||
                prev.identityDetails.idPhotoBack,
            },
          }));
        }
      } catch (error) {
        console.log("Guest not found or error fetching guest details");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedRoom = filteredRooms.find(
        (room) => room.room_number === formData.roomNumber
      );

      if (!selectedRoom && !isEditMode) {
        alert("Please select a valid room");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();

      // Prepare booking data without files
      const { idProofImageUrl, idProofImageUrl2, photoUrl, ...cleanFormData } =
        formData;
      const { identityDetails, guestDetails, ...restData } = cleanFormData;
      const { idPhotoFront, idPhotoBack, ...restIdentityDetails } =
        identityDetails;
      const { photoFile, ...restGuestDetails } = guestDetails;

      // Basic fields
      formDataToSend.append(
        "categoryId",
        selectedCategory || formData.categoryId
      );
      formDataToSend.append(
        "roomRate",
        selectedRoom?.price || formData.roomRate
      );
      formDataToSend.append("vip", formData.vip);
      formDataToSend.append("isForeignGuest", formData.isForeignGuest);

      // Add other fields
      if (formData.grcNo) formDataToSend.append("grcNo", formData.grcNo);
      if (formData.bookingRefNo)
        formDataToSend.append("bookingRefNo", formData.bookingRefNo);
      if (formData.reservationId)
        formDataToSend.append("reservationId", formData.reservationId);
      if (formData.roomNumber)
        formDataToSend.append("roomNumber", formData.roomNumber);
      if (formData.numberOfRooms)
        formDataToSend.append("numberOfRooms", formData.numberOfRooms);
      if (formData.status) formDataToSend.append("status", formData.status);

      // Guest Details
      formDataToSend.append(
        "guestDetails[salutation]",
        restGuestDetails.salutation || ""
      );
      formDataToSend.append("guestDetails[name]", restGuestDetails.name || "");
      formDataToSend.append("guestDetails[age]", restGuestDetails.age || "");
      formDataToSend.append(
        "guestDetails[gender]",
        restGuestDetails.gender || ""
      );

      // Contact Details
      formDataToSend.append(
        "contactDetails[phone]",
        formData.contactDetails.phone || ""
      );
      formDataToSend.append(
        "contactDetails[email]",
        formData.contactDetails.email || ""
      );
      formDataToSend.append(
        "contactDetails[address]",
        formData.contactDetails.address || ""
      );
      formDataToSend.append(
        "contactDetails[city]",
        formData.contactDetails.city || ""
      );
      formDataToSend.append(
        "contactDetails[state]",
        formData.contactDetails.state || ""
      );
      formDataToSend.append(
        "contactDetails[country]",
        formData.contactDetails.country || ""
      );
      formDataToSend.append(
        "contactDetails[pinCode]",
        formData.contactDetails.pinCode || ""
      );

      // Identity Details
      formDataToSend.append(
        "identityDetails[idType]",
        restIdentityDetails.idType || ""
      );
      formDataToSend.append(
        "identityDetails[idNumber]",
        restIdentityDetails.idNumber || ""
      );

      // Booking Info
      formDataToSend.append(
        "bookingInfo[checkIn]",
        formData.bookingInfo.checkIn || ""
      );
      formDataToSend.append(
        "bookingInfo[checkOut]",
        formData.bookingInfo.checkOut || ""
      );
      formDataToSend.append(
        "bookingInfo[actualCheckInTime]",
        formData.bookingInfo.actualCheckInTime || ""
      );
      formDataToSend.append(
        "bookingInfo[actualCheckOutTime]",
        formData.bookingInfo.actualCheckOutTime || ""
      );
      formDataToSend.append(
        "bookingInfo[arrivalFrom]",
        formData.bookingInfo.arrivalFrom || ""
      );
      formDataToSend.append(
        "bookingInfo[bookingType]",
        formData.bookingInfo.bookingType || ""
      );
      formDataToSend.append(
        "bookingInfo[purposeOfVisit]",
        formData.bookingInfo.purposeOfVisit || ""
      );
      formDataToSend.append(
        "bookingInfo[remarks]",
        formData.bookingInfo.remarks || ""
      );
      formDataToSend.append(
        "bookingInfo[adults]",
        formData.bookingInfo.adults || ""
      );
      formDataToSend.append(
        "bookingInfo[children]",
        formData.bookingInfo.children || ""
      );

      // Payment Details
      formDataToSend.append(
        "paymentDetails[totalAmount]",
        formData.paymentDetails.totalAmount || ""
      );
      formDataToSend.append(
        "paymentDetails[advancePaid]",
        formData.paymentDetails.advancePaid || ""
      );
      formDataToSend.append(
        "paymentDetails[paymentMode]",
        formData.paymentDetails.paymentMode || ""
      );
      formDataToSend.append(
        "paymentDetails[billingName]",
        formData.paymentDetails.billingName || ""
      );
      formDataToSend.append(
        "paymentDetails[billingAddress]",
        formData.paymentDetails.billingAddress || ""
      );
      formDataToSend.append(
        "paymentDetails[gstNumber]",
        formData.paymentDetails.gstNumber || ""
      );
      formDataToSend.append(
        "paymentDetails[discountPercent]",
        formData.paymentDetails.discountPercent || ""
      );

      // Vehicle Details
      formDataToSend.append(
        "vehicleDetails[vehicleNumber]",
        formData.vehicleDetails.vehicleNumber || ""
      );
      formDataToSend.append(
        "vehicleDetails[vehicleType]",
        formData.vehicleDetails.vehicleType || ""
      );
      formDataToSend.append(
        "vehicleDetails[vehicleModel]",
        formData.vehicleDetails.vehicleModel || ""
      );
      formDataToSend.append(
        "vehicleDetails[driverName]",
        formData.vehicleDetails.driverName || ""
      );
      formDataToSend.append(
        "vehicleDetails[driverMobile]",
        formData.vehicleDetails.driverMobile || ""
      );

      // Add files
      if (idPhotoFront && typeof idPhotoFront !== "string") {
        formDataToSend.append("idPhotoFront", idPhotoFront);
      }
      if (idPhotoBack && typeof idPhotoBack !== "string") {
        formDataToSend.append("idPhotoBack", idPhotoBack);
      }
      if (photoFile) {
        formDataToSend.append("guestPhoto", photoFile);
      }

      const url = isEditMode
        ? `${BACKEND_URL}/api/bookings/update/${id}`
        : `${BACKEND_URL}/api/bookings/book`;

      const method = isEditMode ? "put" : "post";
      const response = await axios[method](url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/bookings");
      } else {
        throw new Error(response.data.message || "Failed to save booking");
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error(error.message || "Failed to save booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (formData.bookingInfo.checkIn && formData.bookingInfo.checkOut) {
      const checkIn = new Date(formData.bookingInfo.checkIn);
      const checkOut = new Date(formData.bookingInfo.checkOut);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 1;
    }
    return 1;
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const getBaseRate = () => {
    // In edit mode, use the roomRate from formData
    if (isEditMode && formData.roomRate) {
      return formData.roomRate;
    }

    // In create mode, get base rate from selected room
    const allRooms = rooms.flatMap((group) => group.rooms);
    const selectedRoom = allRooms.find(
      (room) => room.room_number === formData.roomNumber
    );
    return selectedRoom ? selectedRoom.price : formData.roomRate || 0;
  };

  const calculateSubtotal = () => {
    const days = calculateDays();
    const baseRate = getBaseRate();
    return baseRate * days * formData.numberOfRooms;
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountPercent = formData.paymentDetails.discountPercent || 0;
    return (subtotal * discountPercent) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const advance = formData.paymentDetails.advancePaid || 0;
    return total - advance;
  };

  const totalAmount = calculateTotal();

  // Update the page title and button text based on mode
  const pageTitle = isEditMode ? "Edit Booking" : "New Booking";
  const submitButtonText = isEditMode ? "Update Booking" : "Create Booking";

  // Show loading state while fetching booking data
  if (initialLoading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-12 h-12 text-secondary animate-spin" />
          <span className="mt-4 text-dark">Loading booking data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6  min-h-screen">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full bg-white/50 hover:bg-white/80"
        >
          <ArrowLeft className="w-5 h-5 text-dark" />
        </button>
        <h2 className="text-2xl font-bold text-dark">{pageTitle}</h2>
      </div>



      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Booking Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2" />
            Booking Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                GRC Number*
              </label>
              <input
                type="text"
                name="grcNo"
                value={formData.grcNo}
                onChange={handleGrcChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Booking Reference No.*
              </label>
              <input
                type="text"
                name="bookingRefNo"
                value={formData.bookingRefNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="Booked">Booked</option>
                <option value="Checked In">Checked In</option>
                <option value="Checked Out">Checked Out</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <User className="w-5 h-5 mr-2" />
            Guest Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-3 mt-4">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Guest Photo
              </label>
              {formData.photoUrl ? (
                <div className="relative h-40 w-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.photoUrl}
                    alt="Guest Photo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeGuestPhoto}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Upload guest photo</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleGuestPhotoUpload}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Salutation
              </label>
              <input
                type="text"
                name="guestDetails.salutation"
                value={formData.guestDetails.salutation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Name
              </label>
              <input
                type="text"
                name="guestDetails.name"
                value={formData.guestDetails.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Age
              </label>
              <input
                type="number"
                name="guestDetails.age"
                value={formData.guestDetails.age}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Gender
              </label>
              <select
                name="guestDetails.gender"
                value={formData.guestDetails.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vip"
                  name="vip"
                  checked={formData.vip}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="vip" className="text-sm text-dark">
                  VIP Guest
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isForeignGuest"
                  name="isForeignGuest"
                  checked={formData.isForeignGuest}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="isForeignGuest" className="text-sm text-dark">
                  Foreign Guest
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark mb-4">
            Contact Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="contactDetails.phone"
                value={formData.contactDetails.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Email
              </label>
              <input
                type="email"
                name="contactDetails.email"
                value={formData.contactDetails.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                City
              </label>
              <input
                type="text"
                name="contactDetails.city"
                value={formData.contactDetails.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                State
              </label>
              <input
                type="text"
                name="contactDetails.state"
                value={formData.contactDetails.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Country
              </label>
              <input
                type="text"
                name="contactDetails.country"
                value={formData.contactDetails.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Pin Code
              </label>
              <input
                type="text"
                name="contactDetails.pinCode"
                value={formData.contactDetails.pinCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Address
              </label>
              <textarea
                name="contactDetails.address"
                value={formData.contactDetails.address}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        {/* Identity Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark mb-4">
            Identity Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                ID Type
              </label>
              <select
                name="identityDetails.idType"
                value={formData.identityDetails.idType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Select ID Type</option>
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                ID Number
              </label>
              <input
                type="text"
                name="identityDetails.idNumber"
                value={formData.identityDetails.idNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            {/* ID Proof Image Upload - Front */}
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                ID Proof Image (Front)
              </label>
              {formData.idProofImageUrl ? (
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.idProofImageUrl}
                    alt="ID Proof Front"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeIdProofImage(1)}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Upload front side</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleIdProofImageUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => openCamera("front")}
                    className="w-12 h-32 flex flex-1 items-center justify-center bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100"
                    title="Take photo with camera"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* ID Proof Image Upload - Back */}
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                ID Proof Image (Back)
              </label>
              {formData.idProofImageUrl2 ? (
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.idProofImageUrl2}
                    alt="ID Proof Back"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeIdProofImage(2)}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Upload back side</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleIdProofImage2Upload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => openCamera("back")}
                    className="w-12 h-32 flex flex-1 items-center justify-center bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100"
                    title="Take photo with camera"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark mb-4">
            Booking Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Check-in Date*
              </label>
              <input
                type="date"
                name="bookingInfo.checkIn"
                value={formData.bookingInfo.checkIn}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Actual Check-in Time
              </label>
              <input
                type="time"
                name="bookingInfo.actualCheckInTime"
                value={formData.bookingInfo.actualCheckInTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Check-out Date*
              </label>
              <input
                type="date"
                name="bookingInfo.checkOut"
                value={formData.bookingInfo.checkOut}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Actual Check-out Time
              </label>
              <input
                type="time"
                name="bookingInfo.actualCheckOutTime"
                value={formData.bookingInfo.actualCheckOutTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Booking Type
              </label>
              <select
                name="bookingInfo.bookingType"
                value={formData.bookingInfo.bookingType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="Online">Online</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Agent">Agent</option>
                <option value="Corporate">Corporate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Adults
              </label>
              <input
                type="number"
                name="bookingInfo.adults"
                value={formData.bookingInfo.adults}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Children
              </label>
              <input
                type="number"
                name="bookingInfo.children"
                value={formData.bookingInfo.children}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Arrival From
              </label>
              <input
                type="text"
                name="bookingInfo.arrivalFrom"
                value={formData.bookingInfo.arrivalFrom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Purpose of Visit
              </label>
              <input
                type="text"
                name="bookingInfo.purposeOfVisit"
                value={formData.bookingInfo.purposeOfVisit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Remarks
              </label>
              <textarea
                name="bookingInfo.remarks"
                value={formData.bookingInfo.remarks}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        {/* Room Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <Home className="w-5 h-5 mr-2" />
            Room Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Room Category
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Room Number*
              </label>
              <select
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              >
                <option value="">Select Room</option>
                {filteredRooms.map((room) => (
                  <option key={room._id} value={room.room_number}>
                    Room {room.room_number} - {room.title} (₹{room.price}/night)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Number of Rooms
              </label>
              <input
                type="number"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Total Amount*
              </label>
              <input
                type="number"
                name="paymentDetails.totalAmount"
                value={formData.paymentDetails.totalAmount}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Advance Paid
              </label>
              <input
                type="number"
                name="paymentDetails.advancePaid"
                value={formData.paymentDetails.advancePaid}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="paymentDetails.discountPercent"
                value={formData.paymentDetails.discountPercent}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Payment Mode
              </label>
              <select
                name="paymentDetails.paymentMode"
                value={formData.paymentDetails.paymentMode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Billing Name
              </label>
              <input
                type="text"
                name="paymentDetails.billingName"
                value={formData.paymentDetails.billingName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                GST Number
              </label>
              <input
                type="text"
                name="paymentDetails.gstNumber"
                value={formData.paymentDetails.gstNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Billing Address
              </label>
              <textarea
                name="paymentDetails.billingAddress"
                value={formData.paymentDetails.billingAddress}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark mb-4">
            Vehicle Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleDetails.vehicleNumber"
                value={formData.vehicleDetails.vehicleNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Vehicle Type
              </label>
              <input
                type="text"
                name="vehicleDetails.vehicleType"
                value={formData.vehicleDetails.vehicleType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Vehicle Model
              </label>
              <input
                type="text"
                name="vehicleDetails.vehicleModel"
                value={formData.vehicleDetails.vehicleModel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                name="vehicleDetails.driverName"
                value={formData.vehicleDetails.driverName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-1">
                Driver Mobile
              </label>
              <input
                type="tel"
                name="vehicleDetails.driverMobile"
                value={formData.vehicleDetails.driverMobile}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-secondary/20 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-dark flex items-center mb-4">
            <CreditCard className="w-5 h-5 mr-2" />
            Booking Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-dark/10">
              <span className="text-dark/70">Room Rate (per night):</span>
              <span className="font-medium text-dark">₹{getBaseRate()}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dark/10">
              <span className="text-dark/70">Number of Days:</span>
              <span className="font-medium text-dark">{calculateDays()}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dark/10">
              <span className="text-dark/70">Number of Rooms:</span>
              <span className="font-medium text-dark">
                {formData.numberOfRooms}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dark/10">
              <span className="text-dark/70">Subtotal:</span>
              <span className="font-medium text-dark">
                ₹{calculateSubtotal()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dark/10">
              <span className="text-dark/70">
                Discount ({formData.paymentDetails.discountPercent}%):
              </span>
              <span className="font-medium text-red-600">
                -₹{calculateDiscount()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dark/10">
              <span className="text-dark/70">Advance Paid:</span>
              <span className="font-medium text-green-600">
                ₹{formData.paymentDetails.advancePaid || 0}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-t-2 border-dark/20">
              <span className="text-lg font-semibold text-dark">
                Total Amount:
              </span>
              <span className="text-xl font-bold text-dark">
                ₹{calculateTotal()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-dark/70">Balance Due:</span>
              <span
                className={`font-medium ${
                  calculateBalance() > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                ₹{calculateBalance()}
              </span>
            </div>

            {formData.bookingInfo.checkIn && formData.bookingInfo.checkOut && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Calculation:</strong> ₹{getBaseRate()} ×{" "}
                  {calculateDays()} days × {formData.numberOfRooms} room(s) = ₹
                  {calculateSubtotal()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-secondary text-dark rounded-lg hover:shadow-lg transition-shadow font-medium flex items-center"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {isEditMode ? "Update Booking" : "Create Booking"}
              </>
            )}
          </button>
        </div>
        {showCamera && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Take Photo -{" "}
                  {currentCameraTarget === "front" ? "Front Side" : "Back Side"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCamera(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative rounded-lg overflow-hidden">
                <Webcam
                  audio={false}
                  mirrored={true}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  }}
                  onUserMediaError={(error) => {
                    console.error("Webcam error:", error);
                    alert("Failed to access camera. Please check permissions.");
                    setShowCamera(false);
                  }}
                  className="w-full"
                />
              </div>

              <div className="flex justify-center space-x-3 mt-4">
                <button
                  type="button"
                  onClick={switchCamera}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Switch Camera
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Capture Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
