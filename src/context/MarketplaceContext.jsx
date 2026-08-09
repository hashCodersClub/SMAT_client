import { createContext, useContext, useState } from "react";
import demoSessionsApi from "../api/demoSessionsApi";
import opportunitiesApi from "../api/opportunitiesApi";
import assignmentsApi from "../api/assignmentsApi";

const MarketplaceContext = createContext(null);

export const MarketplaceProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Schedule Demo / Reschedule Demo
  |--------------------------------------------------------------------------
  */
  const scheduleDemo = async ({
    opportunityId,
    demoSessionId,
    scheduledAt,
    meetingLink,
    notes,
  }) => {
    try {
      setLoading(true);
      setError(null);
      const res = await demoSessionsApi.scheduleVendorDemo({
        opportunityId,
        demoSessionId,
        scheduledAt,
        meetingLink,
        notes,
      });
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to schedule demo session.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cancel Demo
  |--------------------------------------------------------------------------
  */
  const cancelDemo = async (demoSessionId, notes = "") => {
    try {
      setLoading(true);
      setError(null);
      const res = await demoSessionsApi.cancelDemo(demoSessionId, { notes });
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel demo session.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Select Trainer (Triggers Automatic Assignment Creation)
  |--------------------------------------------------------------------------
  */
  const selectTrainer = async (opportunityId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await opportunitiesApi.selectTrainer(opportunityId);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to select trainer.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reject Trainer
  |--------------------------------------------------------------------------
  */
  const rejectTrainer = async (opportunityId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await opportunitiesApi.rejectTrainer(opportunityId);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reject trainer.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Trainer Confirm Assignment
  |--------------------------------------------------------------------------
  */
  const confirmAssignment = async (assignmentId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await assignmentsApi.confirmMine(assignmentId);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to confirm assignment.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Trainer Reject Assignment
  |--------------------------------------------------------------------------
  */
  const rejectAssignment = async (assignmentId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await assignmentsApi.rejectMine(assignmentId);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reject assignment.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketplaceContext.Provider
      value={{
        loading,
        error,
        scheduleDemo,
        cancelDemo,
        selectTrainer,
        rejectTrainer,
        confirmAssignment,
        rejectAssignment,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
};

export default MarketplaceContext;
