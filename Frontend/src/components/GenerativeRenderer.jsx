import React from 'react';
import Callout from './Callout';
import CollegeCard from './CollegeCard';
import CutoffTable from './CutoffTable';
import BranchForm from './BranchForm';
import UnknownComponent from './UnknownComponent';

// Scaled Catalog Imports
import AdmissionTimeline from './AdmissionTimeline';
import DocumentsRequired from './DocumentsRequired';
import FeeStructure from './FeeStructure';
import FacilitiesList from './FacilitiesList';
import PlacementStats from './PlacementStats';
import ScholarshipCard from './ScholarshipCard';
import LocationMap from './LocationMap';
import ContactCard from './ContactCard';
import FAQAccordion from './FAQAccordion';
import UserReview from './UserReview';

// Component registry mapping type strings to React component references
export const REGISTRY = {
  Callout,
  CollegeCard,
  CutoffTable,
  BranchForm,
  AdmissionTimeline,
  DocumentsRequired,
  FeeStructure,
  FacilitiesList,
  PlacementStats,
  ScholarshipCard,
  LocationMap,
  ContactCard,
  FAQAccordion,
  UserReview
};

export default function GenerativeRenderer({ spec, onFormSubmit, onAction }) {
  // Validate basic schema structure to prevent white screen crashes
  if (!spec || typeof spec !== 'object') {
    return <Callout tone="danger" text="Invalid Spec Format: AI response could not be rendered." />;
  }

  const componentsList = spec.components || [];

  if (componentsList.length === 0) {
    return <Callout tone="info" text="No components to display." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {componentsList.map((node, i) => {
        // Safe check for node structure
        if (!node || typeof node !== 'object' || !node.type) {
          return (
            <Callout 
              key={i} 
              tone="danger" 
              text={`Invalid node schema at index ${i}`} 
            />
          );
        }

        const Component = REGISTRY[node.type];

        // Graceful degradation when component is not registered
        if (!Component) {
          return <UnknownComponent key={i} type={node.type} />;
        }

        // Setup dynamic prop hooks
        const extraProps = {
          onAction: onAction
        };
        if (node.type === 'BranchForm') {
          extraProps.onSubmit = onFormSubmit;
        }

        // Safely spread props from spec schema
        const safeProps = node.props || {};

        return <Component key={i} {...safeProps} {...extraProps} />;
      })}
    </div>
  );
}
