// src/components/inspection/QuestionInput.jsx

import { useState, useRef } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    Info,
    Upload,
    FileText,
    X,
    Camera,
    Image as ImageIcon,
    AlertTriangle,
} from 'lucide-react';

const AnswerBtn = ({ label, icon, variant, selected, onClick, disabled }) => (
    <button
        type="button"
        className={`equip_Checklist__answerBtn equip_Checklist__answerBtn--${variant} ${selected ? 'equip_Checklist__answerBtn--selected' : ''
            }`}
        onClick={onClick}
        disabled={disabled}
    >
        {icon}
        {label}
    </button>
);

// ─── Detect if an answer is "negative" (needs evidence) ───
const isNegativeAnswer = (questionType, answer) => {
    if (!answer) return false;
    if (questionType === 'pass_fail' && answer === 'Needs Repair') return true;
    if (questionType === 'yes_no' && answer === 'No') return true;
    if (questionType === 'priority' && ['Critical', 'High'].includes(answer))
        return true;
    return false;
};

const QuestionInput = ({
    question,
    response,
    disabled,
    uploading,
    onAnswerChange,
    onNoteChange,
    onUploadClick,
    onFileSelect,
    onRemoveImage,
}) => {
    const {
        questionType = 'pass_fail',
        options = [],
        questionNumber,
        questionText,
    } = question;
    const answer = response.answer || '';

    const [chooserOpen, setChooserOpen] = useState(false);
    const fileInputRef = useRef(null);

    const needsEvidence = isNegativeAnswer(questionType, answer);
    const hasEvidence = (response.images?.length || 0) > 0;
    const showWarning = needsEvidence && !hasEvidence;

    // ─── Media input ───
    const renderMediaInput = () => {
        const isPhoto = questionType === 'photo';

        const handleAttachClick = () => {
            if (isPhoto) setChooserOpen(v => !v);
            else onUploadClick(questionType);
        };

        const handleCameraClick = () => {
            setChooserOpen(false);
            onUploadClick('photo');
        };

        const handleGalleryClick = () => {
            setChooserOpen(false);
            fileInputRef.current?.click();
        };

        const handleFileChange = e => {
            const file = e.target.files?.[0];
            if (!file) return;
            onFileSelect(file);
            e.target.value = '';
        };

        return (
            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    className="equip_Checklist__uploadBtn"
                    onClick={handleAttachClick}
                    disabled={disabled || uploading}
                >
                    <Upload size={16} />
                    {uploading
                        ? 'Uploading…'
                        : isPhoto
                            ? 'Attach Photo'
                            : `Attach ${questionType}`}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                        questionType === 'photo'
                            ? 'image/*'
                            : questionType === 'video'
                                ? 'video/*'
                                : '*'
                    }
                    capture={questionType === 'photo' ? 'environment' : undefined}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                {isPhoto && chooserOpen && (
                    <div className="equip_Checklist__chooser">
                        <button
                            type="button"
                            className="equip_Checklist__chooserBtn"
                            onClick={handleCameraClick}
                        >
                            <Camera size={16} /> Take Photo
                        </button>
                        <button
                            type="button"
                            className="equip_Checklist__chooserBtn"
                            onClick={handleGalleryClick}
                        >
                            <ImageIcon size={16} /> Choose from Gallery
                        </button>
                    </div>
                )}

                {response.images?.length > 0 && (
                    <div className="equip_Checklist__images">
                        {response.images.map((img, i) => (
                            <div key={i} className="equip_Checklist__imageTile">
                                {img.mimeType?.startsWith('image') ? (
                                    <img
                                        src={`data:${img.mimeType};base64,${img.data}`}
                                        alt="Evidence"
                                    />
                                ) : (
                                    <div className="equip_Checklist__imagePlaceholder">
                                        <FileText size={26} />
                                    </div>
                                )}
                                {!disabled && (
                                    <button
                                        type="button"
                                        className="equip_Checklist__imageRemove"
                                        onClick={() => onRemoveImage(i)}
                                        aria-label="Remove"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ─── Evidence prompt (attached to negative answers) ───
    const renderEvidencePrompt = () => {
        if (!showWarning) return null;

        return (
            <div className="equip_Checklist__evidencePrompt">
                <div className="equip_Checklist__evidencePromptText">
                    <AlertTriangle size={16} />
                    <span>
                        Photo evidence recommended for this finding
                    </span>
                </div>
                {!disabled && (
                    <div className="equip_Checklist__evidencePromptActions">
                        <button
                            type="button"
                            className="equip_Checklist__evidenceBtn"
                            onClick={() => onUploadClick('photo')}
                            disabled={uploading}
                        >
                            <Camera size={14} /> Take Photo
                        </button>
                        <button
                            type="button"
                            className="equip_Checklist__evidenceBtn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <ImageIcon size={14} /> Gallery
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderInput = () => {
        switch (questionType) {
            case 'pass_fail':
                return (
                    <div className="equip_Checklist__answers">
                        <AnswerBtn
                            label="OK"
                            icon={<CheckCircle2 size={16} />}
                            variant="ok"
                            selected={answer === 'OK'}
                            onClick={() => !disabled && onAnswerChange('OK')}
                            disabled={disabled}
                        />
                        <AnswerBtn
                            label="Needs Repair"
                            icon={<AlertCircle size={16} />}
                            variant="repair"
                            selected={answer === 'Needs Repair'}
                            onClick={() => !disabled && onAnswerChange('Needs Repair')}
                            disabled={disabled}
                        />
                        <AnswerBtn
                            label="N/A"
                            icon={<Info size={16} />}
                            variant="na"
                            selected={answer === 'N/A'}
                            onClick={() => !disabled && onAnswerChange('N/A')}
                            disabled={disabled}
                        />
                    </div>
                );

            case 'yes_no':
                return (
                    <div className="equip_Checklist__answers">
                        <AnswerBtn
                            label="Yes"
                            variant="yes"
                            selected={answer === 'Yes'}
                            onClick={() => !disabled && onAnswerChange('Yes')}
                            disabled={disabled}
                        />
                        <AnswerBtn
                            label="No"
                            variant="no"
                            selected={answer === 'No'}
                            onClick={() => !disabled && onAnswerChange('No')}
                            disabled={disabled}
                        />
                    </div>
                );

            case 'priority':
                return (
                    <div className="equip_Checklist__answers">
                        {options.map(opt => (
                            <AnswerBtn
                                key={opt}
                                label={opt}
                                variant={`priority-${opt.toLowerCase()}`}
                                selected={answer === opt}
                                onClick={() => !disabled && onAnswerChange(opt)}
                                disabled={disabled}
                            />
                        ))}
                    </div>
                );

            case 'text':
                return (
                    <textarea
                        className="equip_Checklist__textarea"
                        placeholder="Enter response..."
                        value={answer}
                        onChange={e => onAnswerChange(e.target.value)}
                        disabled={disabled}
                        rows={3}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        className="equip_Checklist__input"
                        placeholder="Enter value"
                        value={answer}
                        onChange={e => onAnswerChange(e.target.value)}
                        disabled={disabled}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        className="equip_Checklist__input"
                        value={answer}
                        onChange={e => onAnswerChange(e.target.value)}
                        disabled={disabled}
                    />
                );

            case 'photo':
            case 'video':
            case 'file':
                return renderMediaInput();

            default:
                return (
                    <p style={{ color: '#9C9588' }}>
                        Unknown question type: {questionType}
                    </p>
                );
        }
    };

    return (
        <div
            className={`equip_Checklist__question ${showWarning ? 'equip_Checklist__question--warning' : ''
                }`}
        >
            <div className="equip_Checklist__questionHeader">
                <div
                    className={`equip_Checklist__qNumber ${answer ? 'equip_Checklist__qNumber--answered' : ''
                        } ${showWarning ? 'equip_Checklist__qNumber--warning' : ''
                        }`}
                >
                    {questionNumber}
                </div>
                <h3 className="equip_Checklist__qText">{questionText}</h3>
            </div>

            {renderInput()}

            {/* Evidence prompt for negative answers */}
            {renderEvidencePrompt()}

            {/* Notes for pass_fail / yes_no / priority */}
            {(questionType === 'pass_fail' ||
                questionType === 'yes_no' ||
                questionType === 'priority') && (
                    <textarea
                        className="equip_Checklist__notes"
                        placeholder="Notes (optional)…"
                        value={response.notes || ''}
                        onChange={e => onNoteChange(e.target.value)}
                        disabled={disabled}
                        rows={2}
                    />
                )}

            {/* Extra evidence for negative answers even on pass_fail/yes_no/priority */}
            {(questionType === 'pass_fail' ||
                questionType === 'yes_no' ||
                questionType === 'priority') &&
                needsEvidence &&
                response.images?.length > 0 && (
                    <div className="equip_Checklist__images">
                        {response.images.map((img, i) => (
                            <div key={i} className="equip_Checklist__imageTile">
                                {img.mimeType?.startsWith('image') ? (
                                    <img
                                        src={`data:${img.mimeType};base64,${img.data}`}
                                        alt="Evidence"
                                    />
                                ) : (
                                    <div className="equip_Checklist__imagePlaceholder">
                                        <FileText size={26} />
                                    </div>
                                )}
                                {!disabled && (
                                    <button
                                        type="button"
                                        className="equip_Checklist__imageRemove"
                                        onClick={() => onRemoveImage(i)}
                                        aria-label="Remove"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
};

export default QuestionInput;