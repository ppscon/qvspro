import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CBOMViewer from './CBOMViewer';
import { mockCBOMData } from '../../data/mock_cbom';

beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
});

describe('CBOMViewer', () => {

  it('renders asset names in cards view', () => {
    render(<CBOMViewer cbomData={mockCBOMData} />);
    fireEvent.click(screen.getByText(/cards/i));
    expect(screen.getByText('JWT Signing')).toBeInTheDocument();
    expect(screen.getByText('Password Hashing')).toBeInTheDocument();
    expect(screen.getByText('Session Encryption')).toBeInTheDocument();
  });

  it('filters by risk level', () => {
    render(<CBOMViewer cbomData={mockCBOMData} />);
    fireEvent.click(screen.getByText(/cards/i));
    fireEvent.change(screen.getByLabelText(/risk/i), { target: { value: 'High' } });
    expect(screen.getByText('JWT Signing')).toBeInTheDocument();
    expect(screen.queryByText('Password Hashing')).not.toBeInTheDocument();
    expect(screen.queryByText('Session Encryption')).not.toBeInTheDocument();
  });

  it('filters by search query', () => {
    render(<CBOMViewer cbomData={mockCBOMData} />);
    fireEvent.click(screen.getByText(/cards/i));
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'session' } });
    expect(screen.getByText('Session Encryption')).toBeInTheDocument();
    expect(screen.queryByText('JWT Signing')).not.toBeInTheDocument();
    expect(screen.queryByText('Password Hashing')).not.toBeInTheDocument();
  });

  it('handles export buttons without error', () => {
    render(<CBOMViewer cbomData={mockCBOMData} />);
    fireEvent.click(screen.getByText(/export json/i));
    fireEvent.click(screen.getByText(/export csv/i));
    // No assertion: just ensure no crash
  });

  it('renders loading and error states', () => {
    render(<CBOMViewer cbomData={null} isLoading={true} />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    render(<CBOMViewer cbomData={null} error="Test error" />);
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });
});
