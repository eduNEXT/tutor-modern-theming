import React from "react";
import PropTypes from "prop-types";
import { getConfig } from "@edx/frontend-platform";
import { LearningHeader as DefaultLearningHeader } from "@edx/frontend-component-header";
// The learning header's inner slots are not re-exported by the package index,
// so they are imported from dist (present in 6.x and 8.x). Rendering them
// keeps any plugin a site already registers in those slots
// (header_learning_course_info.v1, header_learning_help.v1).
import CourseInfoSlot from "@edx/frontend-component-header/dist/plugin-slots/CourseInfoSlot";
import LearningHelpSlot from "@edx/frontend-component-header/dist/plugin-slots/LearningHelpSlot";

import CobaltHeaderBase from "./CobaltHeaderBase";

// Cobalt header for the learning MFE (org.openedx.frontend.layout.header_learning.v1).
// Same chrome as CobaltDesktopHeader; what the learning header needs stays:
// the course lockup instead of the main menu, its Help slot (rendered in the
// shared Help position, so it looks like the other headers' Help link), the
// #main-content skip target and the showUserDropdown prop.
const CobaltLearningHeader = (props) => {
  const { courseOrg, courseNumber, courseTitle, showUserDropdown } = props;
  const cfg = getConfig();

  // Runtime kill-switch, same as CobaltDesktopHeader.
  if (!cfg?.ENABLE_COBALT_HEADER) {
    return <DefaultLearningHeader {...props} />;
  }

  return (
    <CobaltHeaderBase
      skipTo="#main-content"
      logoDestination={`${cfg.LMS_BASE_URL}/dashboard`}
      showUserArea={showUserDropdown}
      help={<LearningHelpSlot />}
    >
      <div className="chd-course-info flex-grow-1 d-flex">
        <CourseInfoSlot
          courseOrg={courseOrg}
          courseNumber={courseNumber}
          courseTitle={courseTitle}
        />
      </div>
    </CobaltHeaderBase>
  );
};

CobaltLearningHeader.propTypes = {
  courseOrg: PropTypes.string,
  courseNumber: PropTypes.string,
  courseTitle: PropTypes.string,
  showUserDropdown: PropTypes.bool,
};

CobaltLearningHeader.defaultProps = {
  courseOrg: null,
  courseNumber: null,
  courseTitle: null,
  showUserDropdown: true,
};

export default CobaltLearningHeader;
